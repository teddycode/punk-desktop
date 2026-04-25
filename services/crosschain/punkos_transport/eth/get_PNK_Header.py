import sys
import json
import requests
import binascii
import os
from dotenv import load_dotenv

# 1. 加载环境变量 (需要安装 python-dotenv: pip install python-dotenv)
# 如果不想安装 dotenv，可以直接在这里写死 RPC_URL，或者通过 os.environ 获取
load_dotenv()

# 获取配置，如果没有读到环境变量，默认使用你提供的 URL
RPC_URL = os.getenv("DEV_RPC_URL", "http://47.243.174.71:36054")
HEADERS = {"Content-Type": "application/json"}

def rpc_post(method, params=[]):
    """
    发送 RPC 请求
    """
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1
    }
    try:
        # 使用 requests 替代 Web3，以兼容 PunkOS 的特殊字段
        response = requests.post(RPC_URL, headers=HEADERS, json=payload, timeout=15)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise Exception(f"RPC request failed: {str(e)}")

def hex_to_utf8_json(hex_str):
    """
    解析 posVoting 等 hex 编码的 json 字符串
    """
    try:
        if hex_str.startswith('0x'):
            hex_str = hex_str[2:]
        if not hex_str: 
            return None
        return json.loads(binascii.unhexlify(hex_str).decode('utf-8'))
    except:
        return hex_str

def get_latest_block_number():
    """
    获取链上最新区块高度
    """
    data = rpc_post("eth_blockNumber")
    if data and "result" in data:
        return int(data["result"], 16)
    raise Exception("Failed to get latest block number from PunkOS")

def get_block_detail(height):
    """
    获取指定高度的区块详情
    """
    hex_height = hex(height)
    # 请求区块详情
    data = rpc_post("eth_getBlockByNumber", [hex_height, True])
    
    if data and "result" in data and data["result"]:
        block = data["result"]
        
        # 将 posVoting 从 Hex 解析为可读对象 (如果需要存入 Raw 数据)
        if "posVoting" in block and block["posVoting"] != "0x":
            block["posVoting_decoded"] = hex_to_utf8_json(block["posVoting"])
            
        return block
    else:
        raise Exception(f"Block {height} not found")

def main():
    # ---------------------------------------------------------
    # 1. 参数校验 (保持与参考代码一致)
    # ---------------------------------------------------------
    if len(sys.argv) < 2:
        print("用法: python get_PNK_Header.py <区块高度>")
        sys.exit(1)

    try:
        height = int(sys.argv[1])
    except ValueError:
        print(json.dumps({"status": False, "message": "Height must be an integer"}))
        sys.exit(1)

    # ---------------------------------------------------------
    # 2. 获取高度逻辑
    # ---------------------------------------------------------
    if height <= 0:
        try:
            height = get_latest_block_number()
        except Exception as e:
            print(json.dumps({"status": False, "message": f"Cannot connect to RPC: {str(e)}"}))
            sys.exit(1)

    try:
        # ---------------------------------------------------------
        # 3. 获取区块数据
        # ---------------------------------------------------------
        block_data = get_block_detail(height)
        block_hash = block_data["hash"]

        # 将完整的区块数据转为 JSON 字符串
        # 这里的 raw_payload 包含了所有数据，外部程序拿到这个JSON后可以自行存库
        raw_payload = json.dumps(block_data, ensure_ascii=False)

        # ---------------------------------------------------------
        # 4. 生成 rawValidators (编码 height)
        # ---------------------------------------------------------
        # 对应 Solidity: abi.encode(uint256(height))
        params_bytes = height.to_bytes(32, byteorder='big')
        encoded_params = "0x" + params_bytes.hex()

        # ---------------------------------------------------------
        # 5. 构造输出结果
        # ---------------------------------------------------------
        # 注意：这里我们不连接数据库，只输出 JSON。
        # 系统的其他部分（调用者）会负责读取这个输出并处理入库。
        output = {
            "status": True,
            "hash": block_hash,
            "raw": raw_payload,             
            "rawValidators": encoded_params,
            "height": height
        }

    except Exception as e:
        # 捕获异常
        output = {
            "status": False,
            "message": str(e)
        }

    # 6. 最终打印 JSON
    print(json.dumps(output, ensure_ascii=False))

if __name__ == "__main__":
    main()
