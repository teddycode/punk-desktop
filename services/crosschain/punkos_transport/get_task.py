import os
from web3 import Web3
from dotenv import load_dotenv

try:
    from contract_resolver import resolve_transport_address
except ImportError:
    from punkos_transport.contract_resolver import resolve_transport_address

load_dotenv()

def get_active_tasks(contract_address, rpc_url):
    # 1. 初始化连接
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    # 2. 最小化 ABI (仅保留查询相关的函数)
    abi = [
        {"inputs": [], "name": "taskNum", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "name": "taskIndex", "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "bytes32", "name": "_taskKey", "type": "bytes32"}], "name": "getTaskInfoByKey", "outputs": [
            {"internalType": "address", "name": "user", "type": "address"},
            {"internalType": "uint256", "name": "fee", "type": "uint256"},
            {"internalType": "uint256", "name": "taskType", "type": "uint256"},
            {"internalType": "address", "name": "relayer", "type": "address"},
            {"internalType": "uint256", "name": "stake", "type": "uint256"},
            {"internalType": "bytes", "name": "payload", "type": "bytes"},
            {"internalType": "uint8", "name": "label", "type": "uint8"}, 
            {"internalType": "uint256", "name": "time", "type": "uint256"}
        ], "stateMutability": "view", "type": "function"}
    ]

    contract = w3.eth.contract(address=contract_address, abi=abi)
    active_tasks = []

    try:
        # 获取总任务数
        total_tasks = contract.functions.taskNum().call()
        print(f"🔎 正在扫描 {total_tasks} 个任务...")

        # 倒序遍历 (最新优先)
        for i in range(total_tasks - 1, -1, -1):
            t_key = contract.functions.taskIndex(i).call()
            info = contract.functions.getTaskInfoByKey(t_key).call()
            
            # info[6] 是 Label (状态)，1 代表 Created (待接单)
            if info[6] == 1:
                task_data = {
                    "index": i,
                    "task_key": t_key.hex(),
                    "user": info[0],
                    "fee_eth": w3.from_wei(info[1], 'ether'),
                    "payload": info[5].hex(),
                    "time": info[7]
                }
                active_tasks.append(task_data)
                print(f"✅ 找到待处理任务: Index {i}, Key {t_key.hex()[:10]}...")
            
    except Exception as e:
        print(f"❌ 读取出错: {e}")

    return active_tasks

if __name__ == "__main__":
    # 配置信息
    RPC_URL = os.getenv("DEV_RPC_URL")
    DEPLOY_ENV = os.getenv("DEPLOY_ENV", "dev")
    web3 = Web3(Web3.HTTPProvider(RPC_URL))
    CONTRACT_ADDR = resolve_transport_address(web3, deploy_env=DEPLOY_ENV)
    print(f"📍 Transport 地址: {CONTRACT_ADDR}")

    tasks = get_active_tasks(CONTRACT_ADDR, RPC_URL)
    
    print(f"\n📊 扫描完成，共发现 {len(tasks)} 个待处理任务。")
    for t in tasks:
        print(f"- 任务ID: {t['task_key']} | 小费: {t['fee_eth']} ETH")
