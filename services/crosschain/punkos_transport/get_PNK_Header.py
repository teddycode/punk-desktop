import sys
import json
from web3 import Web3
from eth_abi import encode

# 配置连接到服务器
RPC_URL = "http://47.243.174.71:36054"

def get_block_header(block_number_arg):
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        
        if not w3.is_connected():
            print(f"Error: Could not connect to {RPC_URL}", file=sys.stderr)
            sys.exit(1)

        # 1. 获取区块信息
        if block_number_arg == "-1" or block_number_arg == -1:
            block = w3.eth.get_block('latest')
        else:
            block = w3.eth.get_block(int(block_number_arg))

        # 提取 Hash 和 Number
        block_hash_bytes = bytes.fromhex(block['hash'].hex().replace("0x", ""))
        block_number = int(block['number'])

        # 2. 【关键修改】打包成 Solidity 能够直接 decode 的格式
        # 对应 Solidity: abi.decode(payload, (bytes32, uint256))
        encoded_data = encode(['bytes32', 'uint256'], [block_hash_bytes, block_number])
        encoded_hex = "0x" + encoded_data.hex()

        # 3. 输出结果
        output = {
            "status": True,
            "hash": block['hash'].hex(),
            "raw": encoded_hex, # 这个字段现在是 "Hash + Number" 的打包数据
            "height": block_number
        }

        print(json.dumps(output))

    except Exception as e:
        error_output = {
            "status": False,
            "error": str(e)
        }
        print(json.dumps(error_output))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
    else:
        arg = "-1"
    
    get_block_header(arg)
