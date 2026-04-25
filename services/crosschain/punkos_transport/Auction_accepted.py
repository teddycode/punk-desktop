import os
import sys
from web3 import Web3
from dotenv import load_dotenv

try:
    from contract_resolver import resolve_transport_address
except ImportError:
    from punkos_transport.contract_resolver import resolve_transport_address

load_dotenv()

# ---------------- 工具函数: 兼容签名提取 ----------------
def get_raw_tx_bytes(signed_tx):
    if hasattr(signed_tx, 'rawTransaction'): return signed_tx.rawTransaction
    if hasattr(signed_tx, 'get') and signed_tx.get('rawTransaction'): return signed_tx['rawTransaction']
    try: return signed_tx[0]
    except: pass
    raise ValueError("无法提取 rawTransaction")

def main():
    # 1. 配置连接
    rpc_url = os.getenv("DEV_RPC_URL")
    private_key = os.getenv("DEV_PRIVATE_KEY")
    deploy_env = os.getenv("DEPLOY_ENV", "dev")
    if not rpc_url or not private_key:
        print("❌ 错误: 缺少环境变量 DEV_RPC_URL 或 DEV_PRIVATE_KEY")
        return

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        print("❌ 无法连接到 RPC")
        return

    account = w3.eth.account.from_key(private_key)
    relayer_address = account.address
    contract_address = resolve_transport_address(w3, deploy_env=deploy_env)
    print(f"👤 中继者账户: {relayer_address}")
    print(f"📍 Transport 地址: {contract_address}")

    # 2. 定义 ABI (包含查询函数和接单函数)
    abi = [
        # 状态读取函数
        {"inputs": [], "name": "taskNum", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "taskIndex", "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "bytes32", "name": "_taskKey", "type": "bytes32"}], "name": "getTaskInfoByKey", "outputs": [
            {"internalType": "address", "name": "user", "type": "address"},
            {"internalType": "uint256", "name": "fee", "type": "uint256"},
            {"internalType": "uint256", "name": "taskType", "type": "uint256"},
            {"internalType": "address", "name": "relayer", "type": "address"},
            {"internalType": "uint256", "name": "stake", "type": "uint256"},
            {"internalType": "bytes", "name": "payload", "type": "bytes"},
            {"internalType": "uint8", "name": "label", "type": "uint8"}, # Enum 在 ABI 中通常转为 uint8
            {"internalType": "uint256", "name": "time", "type": "uint256"}
        ], "stateMutability": "view", "type": "function"},
        # 写入函数
        {"inputs": [{"internalType": "bytes32", "name": "_taskKey", "type": "bytes32"}], "name": "acceptTask", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
    ]

    contract = w3.eth.contract(address=contract_address, abi=abi)

    # 3. 自动查找待接单任务
    print("🔍 正在扫描链上任务列表...")
    
    try:
        total_tasks = contract.functions.taskNum().call()
        print(f"📊 当前总任务数: {total_tasks}")
    except Exception as e:
        print(f"❌ 获取任务数失败: {e}")
        return

    target_task_key = None
    target_payload = None

    # 倒序遍历: 优先处理最新任务
    # range(start, stop, step) -> 从 total_tasks-1 到 0
    for i in range(total_tasks - 1, -1, -1):
        try:
            # 获取 TaskKey
            t_key = contract.functions.taskIndex(i).call()
            # 获取任务详情
            # 返回值顺序: user, fee, taskType, relayer, stake, payload, label, time
            info = contract.functions.getTaskInfoByKey(t_key).call()
            
            task_label = info[6] # Enum: 0=Default, 1=Created, 2=Accepted...
            
            if task_label == 1: # 1 代表 Created (待接单)
                print(f"✅ 发现待接单任务! (Index: {i})")
                print(f"   TaskKey: {t_key.hex()}")
                print(f"   User:    {info[0]}")
                print(f"   Fee:     {w3.from_wei(info[1], 'ether')} ETH")
                print(f"   Payload: {info[5].hex()[:60]}...") # 只打印前60字符
                
                target_task_key = t_key
                target_payload = info[5]
                break # 找到一个就停止
            
            elif task_label == 2:
                # 这是一个已接单的任务，跳过
                continue
                
        except Exception as e:
            print(f"⚠️ 读取索引 {i} 失败: {e}")
            continue

    if target_task_key is None:
        print("zzz 没有发现状态为 'Created' (待接单) 的任务。请先运行 Create Task。")
        return

    # 4. 执行接单 (acceptTask)
    print("\n⚙️  准备接单...")
    
    # 强制 Legacy 模式计算 Gas
    nonce = w3.eth.get_transaction_count(relayer_address)
    gas_price = int(w3.eth.gas_price * 1.1)

    tx_params = {
        'chainId': w3.eth.chain_id,
        'from': relayer_address,
        'value': 0,
        'nonce': nonce,
        'gas': 500000, # 预估稍高一点，因为涉及质押逻辑
        'gasPrice': gas_price
    }

    try:
        # 构建交易
        tx_build = contract.functions.acceptTask(target_task_key).build_transaction(tx_params)
    except Exception as e:
        print(f"❌ 构建交易失败: {e}")
        if "revert" in str(e).lower():
            print("💡 提示: 交易被 Revert。常见原因：")
            print("   1. 你的账户不是 Relayer (需注册)。")
            print("   2. 你的账户在质押合约中的押金不足 (lockStake 失败)。")
        return

    # 签名
    signed_tx = w3.eth.account.sign_transaction(tx_build, private_key)

    # 发送
    try:
        raw_tx = get_raw_tx_bytes(signed_tx)
        print("🚀 发送 acceptTask 交易...")
        tx_hash = w3.eth.send_raw_transaction(raw_tx)
        print(f"🔗 交易 Hash: {tx_hash.hex()}")
        
        print("⏳ 等待确认...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            print("✅ 接单成功! 任务状态已更新为 Accepted。")
            # 可以在这里把 payload 保存到本地文件，供下一步使用
            with open("current_task_payload.txt", "w") as f:
                f.write(target_payload.hex())
            print("💾 Payload 已保存至 current_task_payload.txt 供下一步使用。")
        else:
            print("❌ 交易失败 (Reverted)")

    except Exception as e:
        print(f"❌ 发送失败: {e}")

if __name__ == "__main__":
    main()
