import json
import requests
import rlp
from hexbytes import HexBytes
from web3 import Web3

RPC = "http://47.243.174.71:36054"
TX_HASH = "0x0706d88ac88110b888647b9cced50e69f27e13d73e72b30f45eabb3528daf976"
BLOCK_HEIGHT = 251646

def main():
    w3 = Web3(Web3.HTTPProvider(RPC))
    
    # 注入 POA 中间件（必须）
    from web3.middleware import ExtraDataToPOAMiddleware
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
    
    # 1. 获取交易和回执信息
    tx = w3.eth.get_transaction(TX_HASH)
    receipt = w3.eth.get_transaction_receipt(TX_HASH)
    block = w3.eth.get_block(BLOCK_HEIGHT, full_transactions=True)
    
    print("=== 交易基本信息 ===")
    print(f"区块高度: {receipt['blockNumber']}")
    print(f"交易索引: {receipt['transactionIndex']}")
    print(f"执行状态: {receipt['status']}")
    print(f"Gas 使用: {receipt['gasUsed']}")
    
    # 2. 检查正确的交易索引编码
    tx_index = receipt['transactionIndex']
    print(f"\n=== Key 编码分析 ===")
    print(f"交易在区块中的索引: {tx_index}")
    
    # RLP 编码索引
    if tx_index == 0:
        key_rlp = bytes([0x80])  # 0 的 RLP 编码
    else:
        key_rlp = rlp.encode(tx_index)
    print(f"正确的 RLP 编码 key: 0x{key_rlp.hex()}")
    
    # 3. 检查区块头信息
    print(f"\n=== 区块头信息 ===")
    print(f"区块哈希: {block['hash'].hex()}")
    print(f"Receipts Root: {block['receiptsRoot'].hex()}")
    print(f"区块中交易总数: {len(block['transactions'])}")
    
    # 4. Receipt 详细信息
    print(f"\n=== Receipt 详细信息 ===")
    print(f"累计 Gas: {receipt['cumulativeGasUsed']}")
    print(f"Logs 数量: {len(receipt['logs'])}")
    print(f"Logs Bloom 前20字节: {receipt['logsBloom'].hex()[:40]}")
    
    # 5. 分析 API 返回的证明
    resp = requests.post(
        "http://localhost:3020/api/lcl-proof",
        json={"destTxHash": TX_HASH, "blockHeight": str(BLOCK_HEIGHT)},
        timeout=30,
    )
    data = resp.json()
    
    if "proof" not in data:
        print(f"\n错误: API 未返回证明")
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return
    
    print(f"\n=== API 返回的证明分析 ===")
    print(f"API 返回的区块哈希: {data.get('blockHash', 'N/A')}")
    
    # 解码证明包
    PROOF_BUNDLE_TYPE = "(string,uint256,bytes32,(bytes32,bytes32,address,bytes32,bytes32,bytes32,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes32,bytes,uint256,bytes32),(uint256,bytes,uint256,bytes,(address,bytes[],bytes)[]),bytes,bytes[])"
    (bundle,) = w3.codec.decode([PROOF_BUNDLE_TYPE], HexBytes(data["proof"]))
    chain_name, block_height, dest_tx_hash, header, receipt_data, key_index, receipt_proof = bundle
    
    print(f"\n=== 证明包内容对比 ===")
    print(f"API 的 key_index: 0x{HexBytes(key_index).hex()}")
    print(f"正确的 key 应该是: 0x{key_rlp.hex()}")
    print(f"Key 是否匹配: {HexBytes(key_index) == key_rlp}")
    print(f"\n证明节点数量: {len(receipt_proof)}")
    
    # 检查 receiptsRoot
    header_receipts_root = HexBytes(header[5]).hex()
    block_receipts_root = block['receiptsRoot'].hex()
    print(f"\nHeader 中的 receiptsRoot: {header_receipts_root}")
    print(f"区块的 receiptsRoot: {block_receipts_root}")
    print(f"ReceiptsRoot 是否匹配: {header_receipts_root == block_receipts_root}")
    
    # 检查区块哈希
    api_block_hash = data.get('blockHash', '')
    actual_block_hash = block['hash'].hex()
    print(f"\nAPI 的区块哈希: {api_block_hash}")
    print(f"实际区块哈希: {actual_block_hash}")
    print(f"区块哈希是否匹配: {api_block_hash.lower() == actual_block_hash.lower()}")
    
    # 打印每个证明节点
    print(f"\n=== 证明节点详情 ===")
    for i, node in enumerate(receipt_proof):
        print(f"节点 {i}: 长度={len(node)} 字节, 前20字节={HexBytes(node).hex()[:40]}")

if __name__ == "__main__":
    main()
