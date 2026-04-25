import os
import sys
from web3 import Web3
from eth_abi import decode
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# ---------------- 配置区域 (请核对) ----------------
# 目标合约地址 (你刚刚部署的地址)
DEST_CONTRACT_ADDRESS = "0x93Eb1d3d42eACdee41894FDF0420Ae22266578c6"

# 如果 .env 没配好，可以在这里临时硬编码检查 (建议配在 .env)
# RPC = "http://127.0.0.1:30305"
# KEY = "你的私钥"

# ---------------- 工具函数 ----------------
def get_raw_tx_bytes(signed_tx):
    if hasattr(signed_tx, 'rawTransaction'): return signed_tx.rawTransaction
    if hasattr(signed_tx, 'get') and signed_tx.get('rawTransaction'): return signed_tx['rawTransaction']
    try: return signed_tx[0]
    except: pass
    raise ValueError("无法提取 rawTransaction")

def main():
    # 1. 检查环境变量
    rpc_url = os.getenv("TEST_RPC_URL") # 对应 http://47.243.174.71:36054
    private_key = os.getenv("TEST_PRIVATE_KEY") 
    
    if not rpc_url or not private_key:
        print("❌ 错误: 请先在 .env 文件中配置 TEST_RPC_URL 和 TEST_PRIVATE_KEY")
        print("   TEST_RPC_URL=http://47.243.174.71:36054")
        print("   TEST_PRIVATE_KEY=0xe64deb...")
        return

    # 2. 读取上一步保存的 Payload
    filename = "current_task_payload.txt"
    if not os.path.exists(filename):
        print(f"❌ 错误: 找不到 {filename}。请确保你先成功运行了 accept (接单) 脚本。")
        return

    with open(filename, "r") as f:
        hex_payload = f.read().strip()

    # 3. 解析 Payload (解码出 auctionId 和 lockId)
    print("🔍 正在解析 Payload...")
    try:
        if hex_payload.startswith("0x"): hex_payload = hex_payload[2:]
        payload_bytes = bytes.fromhex(hex_payload)
        
        # 对应源链 emit MatchResultWithdrawn(uint256, uint256, address, uint256)
        decoded = decode(['uint256', 'uint256', 'address', 'uint256'], payload_bytes)
        
        auction_id = decoded[0]
        lock_id = decoded[1]
        
        print(f"   ✅ 解析成功 -> AuctionID: {auction_id}, LockID: {lock_id}")
    except Exception as e:
        print(f"❌ Payload 解析失败: {e}")
        return

    # 4. 连接目标链
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        print(f"❌ 无法连接到目标链 RPC: {rpc_url}")
        return

    account = w3.eth.account.from_key(private_key)
    relayer_addr = account.address
    print(f"👤 中继者地址 (目标链): {relayer_addr}")

    # 5. 准备合约调用
    abi = [{
        "inputs": [
            {"internalType": "uint256", "name": "_auctionId", "type": "uint256"},
            {"internalType": "uint256", "name": "_lockId", "type": "uint256"}
        ],
        "name": "finalizeAuction",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }]
    
    contract = w3.eth.contract(address=DEST_CONTRACT_ADDRESS, abi=abi)

    # 6. 构建交易 (Legacy Mode)
    print(f"⚙️  构建交易 finalizeAuction({auction_id}, {lock_id})...")
    
    nonce = w3.eth.get_transaction_count(relayer_addr)
    gas_price = int(w3.eth.gas_price * 1.1)

    tx_params = {
        'chainId': w3.eth.chain_id,
        'from': relayer_addr,
        'value': 0,
        'nonce': nonce,
        'gas': 300000,
        'gasPrice': gas_price
    }

    try:
        tx_build = contract.functions.finalizeAuction(auction_id, lock_id).build_transaction(tx_params)
    except Exception as e:
        print(f"❌ 构建交易失败: {e}")
        return

    # 7. 签名并发送
    signed_tx = w3.eth.account.sign_transaction(tx_build, private_key)
    
    try:
        raw_tx = get_raw_tx_bytes(signed_tx)
        print("🚀 发送交易至目标链...")
        tx_hash = w3.eth.send_raw_transaction(raw_tx)
        print(f"🔗 交易 Hash: {tx_hash.hex()}")
        
        print("⏳ 等待确认...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            print("✅ 目标链执行成功! 事件已触发。")
            print(f"   Block Number: {receipt.blockNumber}")
            
            # 保存交易 Hash，这是下一步回到源链提交证明的关键证据
            with open("dest_tx_hash.txt", "w") as f:
                f.write(tx_hash.hex())
            print("💾 交易 Hash 已保存至 dest_tx_hash.txt (下一步需要用到)")
        else:
            print("❌ 交易被 Revert (可能ID不对或合约逻辑限制)")

    except Exception as e:
        print(f"❌ 发送失败: {e}")

if __name__ == "__main__":
    main()
