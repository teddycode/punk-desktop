#!/usr/bin/env python3
"""LCL 批量搬运启动器。"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict

SYMBOL = "LCL"
BATCH_SCRIPT = "script/LCL/relay_batch.py"
RPC_ENV_KEY = "LCL_RPC_URL"
HEADER_SCRIPT = "script/LCL/get_LCL_Header.py"
DEFAULT_INTERVAL = 5.0
DEFAULT_PROJECT_ROOT = Path(__file__).resolve().parent


def log(level: str, message: str) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] [{level}] {message}", flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=f"{SYMBOL} 搬运循环脚本")
    parser.add_argument("--env", default="dev", choices=["dev", "test"], help="运行环境")
    parser.add_argument("--interval", type=float, default=DEFAULT_INTERVAL, help="轮询间隔秒数")
    parser.add_argument("--project-root", default=str(DEFAULT_PROJECT_ROOT), help="项目根目录，默认脚本所在目录")
    parser.add_argument("--rpc-url", default="", help="显式指定 RPC URL，优先级最高")
    parser.add_argument("--batch-size", type=int, default=4, help="每批连续区块数，范围 1–32")
    parser.add_argument("--confirmations", type=int, default=2, help="源链确认深度")
    parser.add_argument("--check-config", action="store_true", help="仅检查本地配置，不连接节点或发送交易")
    return parser.parse_args()


def load_env_file(env_path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    if not env_path.exists():
        return values
    for raw_line in env_path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def resolve_rpc(args: argparse.Namespace, env_values: Dict[str, str]) -> str:
    return args.rpc_url or env_values.get(f"{args.env.upper()}_RPC_URL", "")


def validate(project_root: Path, env_values: Dict[str, str], rpc_url: str, run_env: str) -> None:
    if not (project_root / BATCH_SCRIPT).exists():
        raise FileNotFoundError(f"未找到批量中继脚本: {BATCH_SCRIPT}")
    if not (project_root / ".env").exists():
        raise FileNotFoundError("未找到项目根目录下的 .env 文件")
    if not (project_root / HEADER_SCRIPT).exists():
        raise FileNotFoundError(f"未找到取头脚本: {HEADER_SCRIPT}")
    if not rpc_url:
        raise ValueError(f"未找到目标链 RPC，请配置 {run_env.upper()}_RPC_URL 或通过 --rpc-url 指定")
    if not env_values.get(RPC_ENV_KEY):
        raise ValueError(f"缺少源链配置 {RPC_ENV_KEY}（HTTP URL 或 IPC 路径）")
    if run_env == "dev" and "DEV_PRIVATE_KEY" not in env_values:
        raise ValueError("缺少 DEV_PRIVATE_KEY")
    if run_env == "test" and "TEST_PRIVATE_KEY" not in env_values:
        raise ValueError("缺少 TEST_PRIVATE_KEY")
    if not rpc_url.startswith(('http://', 'https://')):
        raise ValueError('目标链 RPC 必须是 HTTP(S) URL')
    from web3 import Web3
    import rlp
    import dotenv
    from web3.middleware import ExtraDataToPOAMiddleware
    for name in ('relay_batch.py', 'get_LCL_Header.py', 'clique_header.py'):
        if not (project_root / 'script/LCL' / name).is_file():
            raise ValueError(f'运行包不完整: {name}')
    abi = json.loads((project_root / 'out/RelayContract.sol/LCL_Relay.json').read_text(encoding='utf-8'))['abi']
    if not {'HEADER_VERSION', 'updateShadowLedgerByRelayer'} <= {f.get('name') for f in abi}:
        raise ValueError('缺少 LCL v2 ABI')
    for name in ('LCL', 'Manager'):
        address = (project_root / f'data/{run_env}/{name}.address').read_text(encoding='utf-8').strip()
        if not Web3.is_checksum_address(address) or int(address, 16) == 0:
            raise ValueError(f'请在 data/{run_env}/{name}.address 填入有效的非零校验和地址')
    try:
        Web3().eth.account.from_key(env_values.get(f'{run_env.upper()}_PRIVATE_KEY', ''))
    except Exception:
        raise ValueError(f'请填写有效的 {run_env.upper()}_PRIVATE_KEY') from None


def build_command(rpc_url: str) -> list[str]:
    return [sys.executable, BATCH_SCRIPT, "--rpc-url", rpc_url]


def main() -> int:
    args = parse_args()
    if not 1 <= args.batch_size <= 32 or args.confirmations < 0 or args.interval <= 0:
        raise ValueError('batch-size 必须为 1–32；confirmations >= 0；interval > 0')

    project_root = Path(args.project_root).expanduser().resolve()
    env_values = load_env_file(project_root / ".env")
    rpc_url = resolve_rpc(args, env_values)
    validate(project_root, env_values, rpc_url, args.env)
    if args.check_config:
        log('INFO', '本地配置检查通过；尚未连接节点或验证链上状态')
        return 0

    runtime_env = os.environ.copy()
    runtime_env.update(env_values)
    # Do not inherit the other environment's source node from the invoking shell.
    runtime_env['LCL_RPC_URL'] = env_values[RPC_ENV_KEY]
    runtime_env["DEPLOY_ENV"] = args.env
    runtime_env["PYTHON_PATH"] = sys.executable

    log("INFO", f"启动 {SYMBOL} 搬运循环，环境={args.env}，间隔={args.interval} 秒")
    log("INFO", f"项目目录: {project_root}")
    log("INFO", f"使用 RPC: {rpc_url}")
    log("INFO", f"使用 Python: {runtime_env['PYTHON_PATH']}")

    command = build_command(rpc_url) + ["--env", args.env, "--interval", str(args.interval),
                                         "--batch-size", str(args.batch_size),
                                         "--confirmations", str(args.confirmations)]
    command[0] = runtime_env["PYTHON_PATH"]
    os.chdir(project_root)
    os.execvpe(command[0], command, runtime_env)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, FileNotFoundError, ImportError, KeyError) as exc:
        log('ERROR', f'{exc}。请按 README 配置，并使用同一 Python 安装 requirements.txt')
        raise SystemExit(1)
