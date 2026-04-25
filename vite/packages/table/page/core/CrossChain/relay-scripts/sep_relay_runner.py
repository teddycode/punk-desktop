#!/usr/bin/env python3
"""SEP 静态搬运脚本。

示例：
  python sep_relay_runner.py --env dev --interval 5
  python sep_relay_runner.py --project-root /path/to/sepCross3 --rpc-url https://rpc.url
"""

from __future__ import annotations

import argparse
import json
import os
import signal
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict
from urllib import error, request
from urllib.parse import urlparse

SYMBOL = "SEP"
FORGE_SCRIPT = "script/SEP/SEP_Relay.s.sol"
RPC_ENV_KEY = "SEPOLIA_RPC_URL"
FULLNODE_RPC_ENV_KEY = "SEPOLIA_FULLNODE_RPC_URL"
HEADER_SCRIPT = "script/SEP/get_SEP_Header.py"
DEFAULT_INTERVAL = 5.0
DEFAULT_FINALITY_DEPTH = 8
DEFAULT_VERIFY_WINDOW = 16
DEFAULT_RPC_TIMEOUT = 15.0
running = True


def discover_project_root() -> Path:
    current = Path(__file__).resolve()
    for candidate in [current.parent, *current.parents]:
        if (candidate / "foundry.toml").exists() or (candidate / ".env").exists():
            return candidate
    return current.parent


DEFAULT_PROJECT_ROOT = discover_project_root()


def log(level: str, message: str) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] [{level}] {message}", flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=f"{SYMBOL} 搬运循环脚本")
    parser.add_argument("--env", default="dev", choices=["dev", "test"], help="运行环境")
    parser.add_argument("--interval", type=float, default=DEFAULT_INTERVAL, help="轮询间隔秒数")
    parser.add_argument("--project-root", default=str(DEFAULT_PROJECT_ROOT), help="项目根目录，默认脚本所在目录")
    parser.add_argument("--rpc-url", default="", help="显式指定 RPC URL，优先级最高")
    parser.add_argument("--fullnode-rpc", default="", help="用于校验的全节点 RPC，默认读取环境变量")
    parser.add_argument("--finality-depth", type=int, default=DEFAULT_FINALITY_DEPTH, help="全节点校验时回退的确认深度")
    parser.add_argument("--verify-window", type=int, default=DEFAULT_VERIFY_WINDOW, help="校验父子哈希连续性的窗口大小")
    parser.add_argument("--skip-fullnode-check", action="store_true", help="跳过全节点预校验")
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


def resolve_fullnode_rpc(args: argparse.Namespace, env_values: Dict[str, str], rpc_url: str) -> str:
    return args.fullnode_rpc or env_values.get(FULLNODE_RPC_ENV_KEY, "") or rpc_url


def validate(
    project_root: Path,
    env_values: Dict[str, str],
    rpc_url: str,
    fullnode_rpc: str,
    run_env: str,
    finality_depth: int,
    verify_window: int,
    skip_fullnode_check: bool,
) -> None:
    if not (project_root / FORGE_SCRIPT).exists():
        raise FileNotFoundError(f"未找到 forge 脚本: {FORGE_SCRIPT}")
    if not (project_root / ".env").exists():
        raise FileNotFoundError("未找到项目根目录下的 .env 文件")
    if HEADER_SCRIPT and not (project_root / HEADER_SCRIPT).exists():
        raise FileNotFoundError(f"未找到取头脚本: {HEADER_SCRIPT}")
    if not rpc_url:
        raise ValueError(f"未找到可用 RPC，请在 .env 中配置 {RPC_ENV_KEY} 或通过 --rpc-url 指定")
    if not skip_fullnode_check and not fullnode_rpc:
        raise ValueError(
            f"未找到可用全节点 RPC，请在 .env 中配置 {FULLNODE_RPC_ENV_KEY}、通过 --fullnode-rpc 指定，或使用 --skip-fullnode-check 跳过"
        )
    if run_env == "dev" and "DEV_PRIVATE_KEY" not in env_values:
        raise ValueError("缺少 DEV_PRIVATE_KEY")
    if run_env == "test" and "TEST_PRIVATE_KEY" not in env_values:
        raise ValueError("缺少 TEST_PRIVATE_KEY")
    if finality_depth < 0:
        raise ValueError("--finality-depth 不能小于 0")
    if verify_window <= 0:
        raise ValueError("--verify-window 必须大于 0")



def build_command(rpc_url: str) -> list[str]:
    return [
        "forge",
        "script",
        FORGE_SCRIPT,
        "--rpc-url",
        rpc_url,
        "--broadcast",
        "-vvvv",
    ]


def rpc_call(rpc_url: str, method: str, params: list[Any]) -> Any:
    payload = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode("utf-8")
    req = request.Request(
        rpc_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=DEFAULT_RPC_TIMEOUT) as response:
            data = json.loads(response.read().decode("utf-8"))
    except error.URLError as exc:
        raise ConnectionError(f"RPC 请求失败: {exc}") from exc
    if data.get("error"):
        raise RuntimeError(f"RPC 返回错误: {data['error']}")
    return data.get("result")


def hex_to_int(value: str) -> int:
    return int(value, 16)


def get_block_by_number(rpc_url: str, height: int) -> Dict[str, Any]:
    result = rpc_call(rpc_url, "eth_getBlockByNumber", [hex(height), False])
    if not result:
        raise RuntimeError(f"全节点未返回区块 {height}")
    return result


def extract_json_payload(raw_output: str) -> Dict[str, Any]:
    lines = [line.strip() for line in raw_output.splitlines() if line.strip()]
    if not lines:
        raise RuntimeError("取头脚本没有输出 JSON")
    for line in reversed(lines):
        try:
            return json.loads(line)
        except json.JSONDecodeError:
            continue
    raise RuntimeError("取头脚本输出中未找到合法 JSON")


def run_header_script(project_root: Path, runtime_env: Dict[str, str], height: int) -> Dict[str, Any]:
    python_path = runtime_env.get("PYTHON_PATH") or sys.executable
    command = [python_path, str(project_root / HEADER_SCRIPT), str(height)]
    result = subprocess.run(
        command,
        cwd=project_root,
        env=runtime_env,
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or f"退出码={result.returncode}"
        raise RuntimeError(f"取头脚本执行失败: {detail}")
    payload = extract_json_payload(result.stdout)
    if not payload.get("status"):
        raise RuntimeError(f"取头脚本返回失败: {payload.get('message', '未知错误')}")
    return payload


def verify_block_window(fullnode_rpc: str, target_height: int, verify_window: int) -> None:
    start_height = max(target_height - verify_window + 1, 0)
    previous_block: Dict[str, Any] | None = None
    for height in range(start_height, target_height + 1):
        current_block = get_block_by_number(fullnode_rpc, height)
        current_number = hex_to_int(current_block["number"])
        if current_number != height:
            raise RuntimeError(f"全节点返回区块号异常: 期望 {height}，实际 {current_number}")
        if previous_block is not None:
            if current_block["parentHash"].lower() != previous_block["hash"].lower():
                raise RuntimeError(f"区块窗口内父哈希不连续: height={height}")
        previous_block = current_block


def verify_header_against_fullnode(
    project_root: Path,
    runtime_env: Dict[str, str],
    fullnode_rpc: str,
    height: int,
) -> str:
    header_payload = run_header_script(project_root, runtime_env, height)
    fullnode_block = get_block_by_number(fullnode_rpc, height)
    script_hash = str(header_payload["hash"]).lower()
    fullnode_hash = str(fullnode_block["hash"]).lower()
    if script_hash != fullnode_hash:
        raise RuntimeError(
            f"区块 {height} 哈希不一致: 取头脚本={script_hash} 全节点={fullnode_hash}"
        )
    return fullnode_hash


def describe_fullnode(fullnode_rpc: str, relay_rpc: str) -> str:
    parsed = urlparse(fullnode_rpc)
    host = parsed.hostname or "unknown"
    if fullnode_rpc == relay_rpc:
        return f"{fullnode_rpc}（与广播 RPC 相同）"
    return f"{fullnode_rpc}（host={host}）"


def verify_fullnode_ready(
    project_root: Path,
    runtime_env: Dict[str, str],
    fullnode_rpc: str,
    finality_depth: int,
    verify_window: int,
) -> tuple[int, int, str]:
    syncing = rpc_call(fullnode_rpc, "eth_syncing", [])
    if syncing not in (False, None):
        raise RuntimeError(f"全节点仍在同步: {syncing}")
    head_height = hex_to_int(rpc_call(fullnode_rpc, "eth_blockNumber", []))
    target_height = max(head_height - finality_depth, 0)
    verify_block_window(fullnode_rpc, target_height, verify_window)
    target_hash = verify_header_against_fullnode(project_root, runtime_env, fullnode_rpc, target_height)
    return head_height, target_height, target_hash



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
    env_file = project_root / ".env"
    env_values = load_env_file(env_file)
    rpc_url = resolve_rpc(args, env_values)
    fullnode_rpc = resolve_fullnode_rpc(args, env_values, rpc_url)
    validate(
        project_root,
        env_values,
        rpc_url,
        fullnode_rpc,
        args.env,
        args.finality_depth,
        args.verify_window,
        args.skip_fullnode_check,
    )

    runtime_env = os.environ.copy()
    runtime_env.update(env_values)
    runtime_env["DEPLOY_ENV"] = args.env
    runtime_env["PYTHON_PATH"] = env_values.get("PYTHON_PATH") or sys.executable

    log("INFO", f"启动 {SYMBOL} 搬运循环，环境={args.env}，间隔={args.interval} 秒")
    log("INFO", f"项目目录: {project_root}")
    log("INFO", f"使用 RPC: {rpc_url}")
    log("INFO", f"使用 Python: {runtime_env['PYTHON_PATH']}")
    if args.skip_fullnode_check:
        log("WARN", "已跳过全节点预校验")
    else:
        log("INFO", f"使用全节点校验源: {describe_fullnode(fullnode_rpc, rpc_url)}")

    round_no = 1
    while running:
        log("INFO", f"开始第 {round_no} 轮搬运")
        if not args.skip_fullnode_check:
            try:
                head_height, target_height, target_hash = verify_fullnode_ready(
                    project_root,
                    runtime_env,
                    fullnode_rpc,
                    args.finality_depth,
                    args.verify_window,
                )
                log(
                    "INFO",
                    f"全节点校验通过: head={head_height}, verifyHeight={target_height}, hash={target_hash}",
                )
            except Exception as exc:
                log("ERROR", f"全节点校验失败，本轮跳过搬运: {exc}")
                round_no += 1
                if running:
                    time.sleep(args.interval)
                continue
        result = subprocess.run(
            build_command(rpc_url),
            cwd=project_root,
            env=runtime_env,
            text=True,
        )

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
    try:
        raise SystemExit(main())
    except Exception as exc:
        log("ERROR", str(exc))
        raise
