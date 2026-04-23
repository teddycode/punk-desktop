import argparse
import json
import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from hexbytes import HexBytes
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

from Auction_finish import PROOF_BUNDLE_TYPE, build_lcl_proof_bundle


PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")


def build_finish_params(
    dest_tx_hash: str,
    block_height: Optional[int] = None,
    dest_rpc_url: str | None = None,
) -> dict:
    rpc_url = dest_rpc_url or os.getenv("TEST_RPC_URL") or os.getenv("DEV_RPC_URL")
    if not rpc_url:
        raise ValueError("缺少目标链 RPC 地址")

    if block_height is not None and block_height <= 0:
        raise ValueError("block_height 必须为正整数")

    tx_hash = dest_tx_hash.strip()
    if not tx_hash.startswith("0x"):
        tx_hash = "0x" + tx_hash

    w3_dest = Web3(Web3.HTTPProvider(rpc_url))
    w3_dest.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

    if not w3_dest.is_connected():
        raise ConnectionError("目标链 RPC 连接失败")

    receipt = w3_dest.eth.get_transaction_receipt(tx_hash)
    if receipt is None:
        raise ValueError("目标交易不存在")

    actual_block_height = int(receipt["blockNumber"])
    if block_height is not None and actual_block_height != block_height:
        raise ValueError(f"交易所在区块高度不匹配：期望 {block_height}，实际 {actual_block_height}")

    proof_context = build_lcl_proof_bundle(w3_dest, tx_hash)
    proof_bytes = w3_dest.codec.encode([PROOF_BUNDLE_TYPE], [proof_context["proof_bundle"]])

    return {
        "proof": HexBytes(proof_bytes).hex(),
        "blockHash": HexBytes(proof_context["key_shadow_block"]).hex(),
        "blockHeight": int(proof_context["block_number"]),
        "destTxHash": HexBytes(tx_hash).hex(),
        "chainName": "LCL",
    }


def main():
    parser = argparse.ArgumentParser(description="Build LCL finishTask proof payload")
    parser.add_argument("--tx-hash", required=True, help="Destination transaction hash")
    parser.add_argument("--block-height", type=int, help="Destination transaction block height")
    parser.add_argument("--rpc-url", help="Destination chain RPC URL")
    args = parser.parse_args()

    result = build_finish_params(args.tx_hash, args.block_height, args.rpc_url)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()