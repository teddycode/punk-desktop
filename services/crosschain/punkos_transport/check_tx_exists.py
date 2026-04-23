import argparse
import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from web3 import Web3
from web3.exceptions import TransactionNotFound
from web3.middleware import ExtraDataToPOAMiddleware


PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


def normalize_tx_hash(tx_hash: str) -> str:
    value = tx_hash.strip()
    if not value.startswith("0x"):
        value = "0x" + value
    return value


def unique_rpc_list(explicit_rpc: str | None) -> list[str]:
    if explicit_rpc and explicit_rpc.strip():
        return [explicit_rpc.strip()]

    candidates = [
        os.getenv("TEST_RPC_URL", "").strip(),
        os.getenv("DEV_RPC_URL", "").strip(),
    ]

    result: list[str] = []
    for rpc_url in candidates:
        if rpc_url and rpc_url not in result:
            result.append(rpc_url)
    return result


def check_tx_on_rpc(tx_hash: str, rpc_url: str) -> dict:
    item = {
        "rpcUrl": rpc_url,
        "connected": False,
        "exists": False,
        "blockNumber": None,
        "blockHash": None,
        "transactionIndex": None,
        "status": None,
        "error": None,
    }

    try:
        web3 = Web3(Web3.HTTPProvider(rpc_url))
        web3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

        if not web3.is_connected():
            item["error"] = "RPC 连接失败"
            return item

        item["connected"] = True

        receipt = web3.eth.get_transaction_receipt(tx_hash)
        item["exists"] = True
        item["blockNumber"] = int(receipt["blockNumber"])
        item["blockHash"] = receipt["blockHash"].hex()
        item["transactionIndex"] = int(receipt["transactionIndex"])
        item["status"] = int(receipt["status"])
    except TransactionNotFound:
        item["error"] = "交易不存在"
    except Exception as error:
        item["error"] = str(error)

    return item


def main() -> int:
    parser = argparse.ArgumentParser(description="检查交易哈希在目标链 RPC 上是否存在")
    parser.add_argument("--tx-hash", required=True, help="要检查的交易哈希")
    parser.add_argument("--rpc-url", help="显式指定 RPC；不传则依次检查 TEST_RPC_URL 和 DEV_RPC_URL")
    args = parser.parse_args()

    tx_hash = normalize_tx_hash(args.tx_hash)
    rpc_list = unique_rpc_list(args.rpc_url)

    if not rpc_list:
        print(json.dumps({"error": "未找到可用 RPC，请设置 .env 的 TEST_RPC_URL/DEV_RPC_URL 或传 --rpc-url"}, ensure_ascii=False))
        return 1

    results = [check_tx_on_rpc(tx_hash, rpc_url) for rpc_url in rpc_list]
    found_item = next((item for item in results if item.get("exists")), None)

    payload = {
        "txHash": tx_hash,
        "found": found_item is not None,
        "foundOnRpc": found_item["rpcUrl"] if found_item else None,
        "results": results,
    }

    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if found_item else 2


if __name__ == "__main__":
    sys.exit(main())