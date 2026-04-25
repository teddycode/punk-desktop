#!/usr/bin/env python3
"""LCL 静态搬运脚本。"""

from __future__ import annotations

import argparse
import os
import signal
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Dict

SYMBOL = "LCL"
FORGE_SCRIPT = "script/LCL/LCL_Relay.d.sol"
RPC_ENV_KEY = "LCL_RPC_URL"
HEADER_SCRIPT = "script/LCL/get_LCL_Header.py"
DEFAULT_INTERVAL = 5.0
DEFAULT_PROJECT_ROOT = Path(__file__).resolve().parent
running = True


def log(level: str, message: str) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] [{level}] {message}", flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=f"{SYMBOL} 搬运循环脚本")
    parser.add_argument("--env", default="dev", choices=["dev", "test"], help="运行环境")
    parser.add_argument("--interval", type=float, default=DEFAULT_INTERVAL, help="轮询间隔秒数")
    parser.add_argument("--project-root", default=str(DEFAULT_PROJECT_ROOT), help="项目根目录，默认脚本所在目录")
    parser.add_argument("--rpc-url", default="", help="显式指定 RPC URL，优先级最高")
    return parser.parse_args()


def load_env_file(env_path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    if not env_path.exists():
        return values
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def resolve_rpc(args: argparse.Namespace, env_values: Dict[str, str]) -> str:
    return args.rpc_url or env_values.get(RPC_ENV_KEY, "")


def validate(project_root: Path, env_values: Dict[str, str], rpc_url: str, run_env: str) -> None:
    if not (project_root / FORGE_SCRIPT).exists():
        raise FileNotFoundError(f"未找到 forge 脚本: {FORGE_SCRIPT}")
    if not (project_root / ".env").exists():
        raise FileNotFoundError("未找到项目根目录下的 .env 文件")
    if not (project_root / HEADER_SCRIPT).exists():
        raise FileNotFoundError(f"未找到取头脚本: {HEADER_SCRIPT}")
    if not rpc_url:
        raise ValueError(f"未找到可用 RPC，请在 .env 中配置 {RPC_ENV_KEY} 或通过 --rpc-url 指定")
    if run_env == "dev" and "DEV_PRIVATE_KEY" not in env_values:
        raise ValueError("缺少 DEV_PRIVATE_KEY")
    if run_env == "test" and "TEST_PRIVATE_KEY" not in env_values:
        raise ValueError("缺少 TEST_PRIVATE_KEY")


def build_command(rpc_url: str) -> list[str]:
    return ["forge", "script", FORGE_SCRIPT, "--rpc-url", rpc_url, "--broadcast", "-vvvv"]


def handle_stop(signum: int, frame) -> None:
    del frame
    global running
    running = False
    log("WARN", f"收到停止信号: {signum}，准备退出循环")


def main() -> int:
    args = parse_args()
    signal.signal(signal.SIGINT, handle_stop)
    signal.signal(signal.SIGTERM, handle_stop)

    project_root = Path(args.project_root).expanduser().resolve()
    env_values = load_env_file(project_root / ".env")
    rpc_url = resolve_rpc(args, env_values)
    validate(project_root, env_values, rpc_url, args.env)

    runtime_env = os.environ.copy()
    runtime_env.update(env_values)
    runtime_env["DEPLOY_ENV"] = args.env
    runtime_env["PYTHON_PATH"] = env_values.get("PYTHON_PATH") or sys.executable

    log("INFO", f"启动 {SYMBOL} 搬运循环，环境={args.env}，间隔={args.interval} 秒")
    log("INFO", f"项目目录: {project_root}")
    log("INFO", f"使用 RPC: {rpc_url}")
    log("INFO", f"使用 Python: {runtime_env['PYTHON_PATH']}")

    round_no = 1
    while running:
        log("INFO", f"开始第 {round_no} 轮搬运")
        result = subprocess.run(build_command(rpc_url), cwd=project_root, env=runtime_env, text=True)
        if result.returncode == 0:
            log("INFO", f"第 {round_no} 轮完成，{args.interval} 秒后继续")
        else:
            log("ERROR", f"第 {round_no} 轮失败，退出码={result.returncode}，{args.interval} 秒后重试")
        round_no += 1
        if running:
            time.sleep(args.interval)

    log("INFO", "搬运循环已停止")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
