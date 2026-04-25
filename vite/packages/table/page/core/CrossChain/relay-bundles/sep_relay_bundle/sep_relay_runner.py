#!/usr/bin/env python3
"""SEP 纯 Python 搬运脚本。"""

from __future__ import annotations

import argparse
import json
import os
import signal
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Tuple
from urllib import error, request
from urllib.parse import urlparse

from eth_account import Account
from eth_utils import keccak, to_checksum_address
from web3 import Web3

SYMBOL = "SEP"
RPC_ENV_KEY = "SEPOLIA_RPC_URL"
FULLNODE_RPC_ENV_KEY = "SEPOLIA_FULLNODE_RPC_URL"
HEADER_SCRIPT = "script/get_SEP_Header.py"
DEFAULT_INTERVAL = 5.0
DEFAULT_FINALITY_DEPTH = 8
DEFAULT_VERIFY_WINDOW = 16
DEFAULT_RPC_TIMEOUT = 15.0
DEFAULT_PROJECT_ROOT = Path(__file__).resolve().parent
MANAGER_FILE_TEMPLATE = "data/{env}/Manager.address"
CONTRACT_STATE_WORKING = 2
running = True

MANAGER_ABI = [
    {
        "inputs": [{"internalType": "string", "name": "_symbol", "type": "string"}],
        "name": "getSourceChainIDBySymbol",
        "outputs": [{"internalType": "uint256", "name": "chainID", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "uint256", "name": "chainID", "type": "uint256"}],
        "name": "getSourceChainInfo",
        "outputs": [
            {"internalType": "string", "name": "symbol", "type": "string"},
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "uint256", "name": "state", "type": "uint256"},
            {"internalType": "uint256", "name": "numSystemContract", "type": "uint256"},
            {"internalType": "address[]", "name": "addressSystemContract", "type": "address[]"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
]

RELAY_ABI = [
    {
        "inputs": [],
        "name": "getContractState",
        "outputs": [{"internalType": "uint256", "name": "currentState", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getRequireStake",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getMyStake",
        "outputs": [{"internalType": "uint256", "name": "stake", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getTopKeyFromShadowLedger_slot",
        "outputs": [{"internalType": "bytes32", "name": "key", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getTopKeyFromShadowLedger",
        "outputs": [{"internalType": "bytes32", "name": "key", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "_keyNew", "type": "bytes32"},
            {"internalType": "bytes32", "name": "_keyOld", "type": "bytes32"},
        ],
        "name": "getCommitState",
        "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "becomeRelayer",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "bytes", "name": "_rawParentShadowBlock", "type": "bytes"},
            {"internalType": "bytes32", "name": "_keyShadowBlock", "type": "bytes32"},
            {"internalType": "bytes32", "name": "_commitShadowBlock", "type": "bytes32"},
        ],
        "name": "updateShadowLedgerByRelayer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
]


def log(level: str, message: str) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] [{level}] {message}", flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=f"{SYMBOL} 纯 Python 搬运循环脚本")
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


def normalize_private_key(raw_key: str) -> str:
    key = raw_key.strip()
    return key if key.startswith("0x") else f"0x{key}"


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
    if not (project_root / ".env").exists():
        raise FileNotFoundError("未找到项目根目录下的 .env 文件")
    if not (project_root / HEADER_SCRIPT).exists():
        raise FileNotFoundError(f"未找到取头脚本: {HEADER_SCRIPT}")
    if not (project_root / MANAGER_FILE_TEMPLATE.format(env=run_env)).exists():
        raise FileNotFoundError("未找到 Manager.address")
    if not rpc_url:
        raise ValueError(f"未找到可用 RPC，请在 .env 中配置 {RPC_ENV_KEY} 或通过 --rpc-url 指定")
    if not skip_fullnode_check and not fullnode_rpc:
        raise ValueError(
            f"未找到可用全节点 RPC，请在 .env 中配置 {FULLNODE_RPC_ENV_KEY}、通过 --fullnode-rpc 指定，或使用 --skip-fullnode-check 跳过"
        )
    key_name = "DEV_PRIVATE_KEY" if run_env == "dev" else "TEST_PRIVATE_KEY"
    if not env_values.get(key_name):
        raise ValueError(f"缺少 {key_name}")
    if finality_depth < 0:
        raise ValueError("--finality-depth 不能小于 0")
    if verify_window <= 0:
        raise ValueError("--verify-window 必须大于 0")


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


def verify_header_against_fullnode(header_module, fullnode_rpc: str, height: int) -> str:
    script_hash, _ = get_block_header(header_module, height)
    fullnode_block = get_block_by_number(fullnode_rpc, height)
    script_hex = f"0x{script_hash.hex()}".lower()
    fullnode_hex = str(fullnode_block["hash"]).lower()
    if script_hex != fullnode_hex:
        raise RuntimeError(f"区块 {height} 哈希不一致: 取头脚本={script_hex} 全节点={fullnode_hex}")
    return fullnode_hex


def verify_fullnode_ready(
    header_module,
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
    target_hash = verify_header_against_fullnode(header_module, fullnode_rpc, target_height)
    return head_height, target_height, target_hash


def describe_fullnode(fullnode_rpc: str, relay_rpc: str) -> str:
    parsed = urlparse(fullnode_rpc)
    host = parsed.hostname or "unknown"
    if fullnode_rpc == relay_rpc:
        return f"{fullnode_rpc}（与广播 RPC 相同）"
    return f"{fullnode_rpc}（host={host}）"


def load_manager_address(project_root: Path, run_env: str) -> str:
    manager_file = project_root / MANAGER_FILE_TEMPLATE.format(env=run_env)
    return to_checksum_address(manager_file.read_text(encoding="utf-8").strip())


def handle_stop(signum: int, frame) -> None:
    del frame
    global running
    running = False
    log("WARN", f"收到停止信号: {signum}，准备退出循环")


def decode_bytes32_as_uint256(raw_value) -> int:
    if isinstance(raw_value, bytes):
        return int.from_bytes(raw_value, byteorder="big")
    if isinstance(raw_value, str):
        return int(raw_value, 16)
    return int(raw_value)


def load_header_module(project_root: Path):
    header_path = project_root / HEADER_SCRIPT
    import importlib.util

    spec = importlib.util.spec_from_file_location("sep_header_module", header_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"无法加载 {header_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def get_block_header(header_module, height: int) -> Tuple[bytes, bytes]:
    block_hash, raw_payload = header_module.get_block_header(height)
    raw_hex = raw_payload[2:] if raw_payload.startswith("0x") else raw_payload
    return bytes.fromhex(block_hash[2:] if block_hash.startswith("0x") else block_hash), bytes.fromhex(raw_hex)


def ensure_relayer(w3: Web3, relay_contract, account) -> None:
    my_stake = relay_contract.functions.getMyStake().call({"from": account.address})
    target_stake = relay_contract.functions.getRequireStake().call() * 2
    if my_stake >= target_stake:
        return
    stake_delta = target_stake - my_stake
    log("INFO", f"当前 stake={my_stake}，补足到 {target_stake}")
    send_transaction(
        w3,
        account,
        relay_contract.functions.becomeRelayer(),
        value=stake_delta,
    )


def send_transaction(w3: Web3, account, contract_function, value: int = 0) -> str:
    base_fee = w3.eth.get_block("latest").get("baseFeePerGas", w3.eth.gas_price)
    max_priority_fee = w3.eth.max_priority_fee if hasattr(w3.eth, "max_priority_fee") else w3.to_wei(2, "gwei")
    tx = contract_function.build_transaction(
        {
            "from": account.address,
            "nonce": w3.eth.get_transaction_count(account.address),
            "value": value,
            "chainId": w3.eth.chain_id,
            "maxFeePerGas": base_fee * 2 + max_priority_fee,
            "maxPriorityFeePerGas": max_priority_fee,
        }
    )
    if "gas" not in tx:
        tx["gas"] = w3.eth.estimate_gas(tx)
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    if receipt.status != 1:
        raise RuntimeError(f"交易失败: {tx_hash.hex()}")
    return tx_hash.hex()


def relay_once(w3: Web3, manager_contract, relay_contract, account, header_module) -> None:
    chain_id = manager_contract.functions.getSourceChainIDBySymbol(SYMBOL).call()
    if chain_id == 0:
        raise RuntimeError("Manager 中未找到 SEP 源链")
    _, _, _, contract_count, addresses = manager_contract.functions.getSourceChainInfo(chain_id).call()
    if contract_count != 1 or not addresses:
        raise RuntimeError("SEP 源链未找到唯一 relay 合约")

    relay_address = to_checksum_address(addresses[0])
    relay_contract = w3.eth.contract(address=relay_address, abi=RELAY_ABI)
    contract_state = relay_contract.functions.getContractState().call()
    if contract_state != CONTRACT_STATE_WORKING:
        log("WARN", f"SEP relay 合约未处于工作状态，state={contract_state}")
        return

    ensure_relayer(w3, relay_contract, account)

    top_height = decode_bytes32_as_uint256(relay_contract.functions.getTopKeyFromShadowLedger_slot().call())
    top_key = relay_contract.functions.getTopKeyFromShadowLedger().call()
    log("INFO", f"当前 topHeight={top_height} topKey={top_key.hex()}")

    new_key, new_raw = get_block_header(header_module, top_height + 1)
    commit_state = relay_contract.functions.getCommitState(new_key, top_key).call()

    if int.from_bytes(commit_state, byteorder="big") == 0:
        log("INFO", "当前节点是首个 relayer，提交第一阶段 commit")
        _, old_raw = get_block_header(header_module, top_height)
        commit_value = keccak(new_raw + bytes.fromhex(account.address[2:]))
        tx_hash = send_transaction(
            w3,
            account,
            relay_contract.functions.updateShadowLedgerByRelayer(old_raw, new_key, commit_value),
        )
    else:
        log("INFO", "当前节点不是首个 relayer，打开已有 commit")
        next_key, next_raw = get_block_header(header_module, top_height + 2)
        commit_value = keccak(next_raw + bytes.fromhex(account.address[2:]))
        tx_hash = send_transaction(
            w3,
            account,
            relay_contract.functions.updateShadowLedgerByRelayer(new_raw, next_key, commit_value),
        )

    log("INFO", f"本轮交易已上链: {tx_hash}")


def main() -> int:
    args = parse_args()
    signal.signal(signal.SIGINT, handle_stop)
    signal.signal(signal.SIGTERM, handle_stop)

    project_root = Path(args.project_root).expanduser().resolve()
    env_values = load_env_file(project_root / ".env")
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

    private_key_name = "DEV_PRIVATE_KEY" if args.env == "dev" else "TEST_PRIVATE_KEY"
    account = Account.from_key(normalize_private_key(env_values[private_key_name]))
    header_module = load_header_module(project_root)

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        raise ConnectionError("无法连接 RPC")

    manager_contract = w3.eth.contract(
        address=load_manager_address(project_root, args.env),
        abi=MANAGER_ABI,
    )

    log("INFO", f"启动 {SYMBOL} 搬运循环，环境={args.env}，间隔={args.interval} 秒")
    log("INFO", f"项目目录: {project_root}")
    log("INFO", f"账户地址: {account.address}")
    log("INFO", f"使用 RPC: {rpc_url}")
    if args.skip_fullnode_check:
        log("WARN", "已跳过全节点预校验")
    else:
        log("INFO", f"使用全节点校验源: {describe_fullnode(fullnode_rpc, rpc_url)}")

    round_no = 1
    while running:
        log("INFO", f"开始第 {round_no} 轮搬运")
        try:
            if not args.skip_fullnode_check:
                head_height, target_height, target_hash = verify_fullnode_ready(
                    header_module,
                    fullnode_rpc,
                    args.finality_depth,
                    args.verify_window,
                )
                log(
                    "INFO",
                    f"全节点校验通过: head={head_height}, verifyHeight={target_height}, hash={target_hash}",
                )
            relay_once(w3, manager_contract, None, account, header_module)
            log("INFO", f"第 {round_no} 轮完成，{args.interval} 秒后继续")
        except Exception as exc:
            log("ERROR", f"第 {round_no} 轮失败: {exc}")
        round_no += 1
        if running:
            time.sleep(args.interval)

    log("INFO", "搬运循环已停止")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
