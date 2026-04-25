import os
from pathlib import Path

from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
HUB_CHAIN_ID = 0
TRANSPORT_LEVEL_ID = 1

MANAGER_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"},
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "name": "contract_chain_index",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
]


def _data_root() -> Path:
    return Path(__file__).resolve().parent.parent / "data"


def _read_address_from_file(deploy_env: str, contract_name: str) -> str:
    file_path = _data_root() / deploy_env / f"{contract_name}.address"
    if not file_path.exists():
        raise FileNotFoundError(f"未找到地址文件: {file_path}")

    address = file_path.read_text(encoding="utf-8").strip()
    if not Web3.is_address(address):
        raise ValueError(f"地址文件内容非法: {file_path} -> {address}")

    return Web3.to_checksum_address(address)


def resolve_transport_address(
    web3: Web3,
    deploy_env: str,
    chain_id: int = HUB_CHAIN_ID,
    level_id: int = TRANSPORT_LEVEL_ID,
) -> str:
    manager_address = _read_address_from_file(deploy_env, "Manager")
    manager_contract = web3.eth.contract(address=manager_address, abi=MANAGER_ABI)

    try:
        transport_address = manager_contract.functions.contract_chain_index(chain_id, level_id).call()
        if Web3.is_address(transport_address) and transport_address != ZERO_ADDRESS:
            return Web3.to_checksum_address(transport_address)
    except Exception as error:
        print(f"⚠️ 通过 Manager 解析 Transport 失败: {error}")

    fallback_address = _read_address_from_file(deploy_env, "Transport")
    print(f"⚠️ 回退到 Transport.address: {fallback_address}")
    return fallback_address