import os
from web3 import Web3
from dotenv import load_dotenv

try:
    from contract_resolver import resolve_transport_address
except ImportError:
    from punkos_transport.contract_resolver import resolve_transport_address

# 加载环境变量
load_dotenv()

def get_raw_tx_bytes(signed_tx):
    """
    兼容不同版本的 web3.py/eth-account 获取 rawTransaction
    """
    if hasattr(signed_tx, 'rawTransaction'):
        return signed_tx.rawTransaction
    if hasattr(signed_tx, 'get') and signed_tx.get('rawTransaction'):
        return signed_tx['rawTransaction']
    try:
        return signed_tx[0]
    except:
        pass
    raise ValueError(f"无法从对象中提取 rawTransaction: {signed_tx}")

def main():
    # ---------------- 配置 ----------------
    rpc_url = os.getenv("DEV_RPC_URL")
    private_key = os.getenv("DEV_PRIVATE_KEY")
    deploy_env = os.getenv("DEPLOY_ENV", "dev")
    
    if not rpc_url or not private_key:
        print("❌ 错误: 请检查 .env 文件中的 DEV_RPC_URL 和 DEV_PRIVATE_KEY")
        return

    # ---------------- Payload 设置 ----------------
    # 直接使用 Log 中的 data，不加随机数
    # 解析：ID=1, ID=2, User=0x040ab..., Value=3.125 ETH
    payload_hex = "00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000040ab1cce91aa43981cb430ce9ed5a48866c7dee000000000000000000000000000000000000000000000002b5e3af16b1880000"
    
    print(f"📦 准备提交原始 Payload (长度: {len(payload_hex)//2} bytes)")

    # 路由配置
    route_name = "Auction"
    task_type = 1
    value_in_eth = 0.01

    # ---------------- 连接 ----------------
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        print("❌ 无法连接到 RPC")
        return

    account = w3.eth.account.from_key(private_key)
    my_address = account.address
    contract_address = resolve_transport_address(w3, deploy_env=deploy_env)
    print(f"👤 账户: {my_address}")
    print(f"📍 Transport 地址: {contract_address}")

    # ---------------- 准备合约 ----------------
    abi = [{
        "inputs": [
            {"type": "bytes", "name": "_payload"},
            {"type": "string", "name": "_routeName"},
            {"type": "uint256", "name": "_taskType"}
        ],
        "name": "createTask",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }]
    contract = w3.eth.contract(address=contract_address, abi=abi)

    # ---------------- 构建交易 ----------------
    print("⚙️  正在构建交易...")
    
    nonce = w3.eth.get_transaction_count(my_address)
    gas_price = int(w3.eth.gas_price * 1.1) 

    tx_params = {
        'chainId': w3.eth.chain_id,
        'from': my_address,
        'value': w3.to_wei(value_in_eth, 'ether'),
        'nonce': nonce,
        'gas': 600000,
        'gasPrice': gas_price
    }

    try:
        # 构建交易：直接使用 raw payload
        tx_build = contract.functions.createTask(
            bytes.fromhex(payload_hex), 
            route_name,
            task_type
        ).build_transaction(tx_params)
        
    except Exception as e:
        print(f"❌ 构建交易失败: {e}")
        return

    # ---------------- 签名与发送 ----------------
    print("✍️  正在签名...")
    signed_tx = w3.eth.account.sign_transaction(tx_build, private_key)

    try:
        raw_tx = get_raw_tx_bytes(signed_tx)
        print("🚀 正在发送...")
        tx_hash = w3.eth.send_raw_transaction(raw_tx)
        print(f"🔗 交易已提交! Hash: {tx_hash.hex()}")
        
        print("⏳ 等待确认...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            print("✅ 任务创建成功!")
            print(f"   - Gas Used: {receipt.gasUsed}")
        else:
            print("❌ 交易失败 (Reverted)")

    except Exception as e:
        print(f"❌ 发送过程出错: {e}")

if __name__ == "__main__":
    main()
