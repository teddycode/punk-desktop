import logging
import json  
import sys 
import os
import rlp
from eth_utils import decode_hex, encode_hex
from web3 import Web3
from dotenv import load_dotenv
from rlp.sedes import big_endian_int, Binary, binary
from typing import Dict, Any, Optional, Tuple

try:
    from web3.middleware import ExtraDataToPOAMiddleware
except Exception:
    ExtraDataToPOAMiddleware = None

try:
    from web3.middleware import geth_poa_middleware
except Exception:
    geth_poa_middleware = None

class ETHBlockHeaderManager:  
    def __init__(  
        self,   
        database_name: str,   
        host: str,   
        port: int,   
        user: str,   
        password: str,
        logger: logging.Logger
    ):    
        self.db_config = {  
            'host': host,  
            'port': port,  
            'user': user,  
            'password': password,  
            'database': database_name  
        }    
        self.logger = logger  
        rpc_url = os.getenv("LCL_RPC_URL", "").strip()
        if not rpc_url:
            raise ValueError("LCL_RPC_URL must identify the source chain (HTTP URL or IPC path)")
        self.logger.info(f"使用 LCL 源链: {rpc_url}")
        provider = Web3.IPCProvider(rpc_url) if rpc_url.endswith(".ipc") else Web3.HTTPProvider(rpc_url)
        self.web3 = Web3(provider)
        self._inject_poa_middleware()
        if self.web3.eth.chain_id != 3030:
            raise ValueError("Expected LCL chain ID 3030")
        if not self.web3.is_connected():
            self.logger.error("无法连接到本地以太坊节点，请检查RPC服务")
            raise ConnectionError("Cannot connect to local Ethereum node")

    def _inject_poa_middleware(self):
        try:
            if ExtraDataToPOAMiddleware is not None:
                self.web3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
                self.logger.info("已注入 ExtraDataToPOAMiddleware")
            elif geth_poa_middleware is not None:
                self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
                self.logger.info("已注入 geth_poa_middleware")
            else:
                self.logger.warning("未找到 PoA middleware，若为 PoA 链可能读取失败")
        except ValueError:
            self.logger.info("PoA middleware 已存在，跳过注入")
        except Exception as e:
            self.logger.warning(f"注入 PoA middleware 失败: {e}")

    @staticmethod
    def _block_value(block: Any, *names: str):
        for name in names:
            if hasattr(block, name):
                return getattr(block, name)
        block_dict = dict(block)
        for name in names:
            if name in block_dict:
                return block_dict[name]
        raise KeyError(f"Missing block field: {names}")

    @staticmethod
    def _to_hex(value: Any) -> str:
        if isinstance(value, str):
            return value if value.startswith("0x") else f"0x{value}"
        if isinstance(value, (bytes, bytearray)):
            return "0x" + bytes(value).hex()
        if hasattr(value, "hex"):
            raw = value.hex()
            return raw if isinstance(raw, str) and raw.startswith("0x") else f"0x{raw}"
        raise TypeError(f"Unsupported hex value type: {type(value)}")

    def getGenesisHeight_API(self) -> int:
        if os.getenv("LCL_GENESIS_HEIGHT", "0").strip() not in ("", "0"):
            raise ValueError("LCL v2 must initialize from genesis (height 0)")
        return 0

    # 定义以太坊块头RLP序列化类
    class BlockHeader(rlp.Serializable):
        fields = [
            ('parent_hash', Binary.fixed_length(32)),
            ('uncle_hash', Binary.fixed_length(32)),
            ('coinbase', Binary.fixed_length(20)),
            ('state_root', Binary.fixed_length(32)),
            ('transactions_root', Binary.fixed_length(32)),
            ('receipts_root', Binary.fixed_length(32)),
            ('logs_bloom', Binary.fixed_length(256)),
            ('difficulty', big_endian_int),
            ('number', big_endian_int),
            ('gas_limit', big_endian_int),
            ('gas_used', big_endian_int),
            ('timestamp', big_endian_int),
            ('extra_data', binary),
            ('mix_hash', Binary.fixed_length(32)),
            ('nonce', Binary.fixed_length(8)),
        ]

    def encode_block_header(self, block) -> str:
        """
        传入 web3.eth.get_block() 返回对象，做RLP编码并返回hex字符串
        """
        try:
            header = self.BlockHeader(
                parent_hash = decode_hex(block['parentHash']),
                uncle_hash = decode_hex(block['sha3Uncles']),
                coinbase = decode_hex(block['miner']),
                state_root = decode_hex(block['stateRoot']),
                transactions_root = decode_hex(block['transactionsRoot']),
                receipts_root = decode_hex(block['receiptsRoot']),
                logs_bloom = decode_hex(block['logsBloom']),
                difficulty = int(block['difficulty']),
                number = int(block['number']),
                gas_limit = int(block['gasLimit']),
                gas_used = int(block['gasUsed']),
                timestamp = int(block['timestamp']),
                extra_data = decode_hex(block['extraData']),
                mix_hash = decode_hex(block['mixHash']),
                nonce = decode_hex(block['nonce'])
            )
            return rlp.encode(header).hex()
        except Exception as e:
            self.logger.error(f"RLP编码块头失败: {e}")
            raise

    def get_execution_header_RPC(self, height: int) -> tuple:
        """
        使用web3通过RPC获取执行层区块，返回 (block_hash, encoded_rlp_header, block_number)
        """
        try:
            block = self.web3.eth.get_block(height)
            if dict(block).get('baseFeePerGas') is not None:
                raise ValueError('LCL v2 requires pre-London headers')
            block_number = int(self._block_value(block, 'number'))
            extra_data_value = self._block_value(block, 'extraData', 'extra_data', 'proofOfAuthorityData')
            block_dict = {
                'parentHash': self._to_hex(self._block_value(block, 'parentHash', 'parent_hash')),
                'sha3Uncles': self._to_hex(self._block_value(block, 'sha3Uncles', 'sha3_uncles')),
                'miner': self._to_hex(self._block_value(block, 'miner', 'author')),
                'stateRoot': self._to_hex(self._block_value(block, 'stateRoot', 'state_root')),
                'transactionsRoot': self._to_hex(self._block_value(block, 'transactionsRoot', 'transactions_root')),
                'receiptsRoot': self._to_hex(self._block_value(block, 'receiptsRoot', 'receipts_root')),
                'logsBloom': self._to_hex(self._block_value(block, 'logsBloom', 'logs_bloom')),
                'difficulty': int(self._block_value(block, 'difficulty')),
                'number': block_number,
                'gasLimit': int(self._block_value(block, 'gasLimit', 'gas_limit')),
                'gasUsed': int(self._block_value(block, 'gasUsed', 'gas_used')),
                'timestamp': int(self._block_value(block, 'timestamp')),
                'extraData': self._to_hex(extra_data_value),
                'mixHash': self._to_hex(self._block_value(block, 'mixHash', 'mix_hash')),
                'nonce': self._to_hex(self._block_value(block, 'nonce'))
            }
            rlp_data = self.encode_block_header(block_dict)
            return self._to_hex(self._block_value(block, 'hash')), rlp_data, block_number
        except Exception as e:
            self.logger.error(f"通过RPC获取区块头失败: {e}")
            raise

    def get_shadow_payload_RPC(self, height: int) -> str:
        key, raw, actual = self.get_execution_header_RPC(height)
        if actual != height or Web3.keccak(hexstr=raw) != decode_hex(key):
            raise ValueError("Source header hash/height mismatch")
        return "0x" + raw.removeprefix("0x")

    def get_block_header(self, height: int) -> Optional[dict]:
        # Read the selected chain directly; height-only DB caches can belong to an old local chain.
        block_hash, raw_block, actual_height = self.get_execution_header_RPC(height)
        return {"hash": block_hash, "height": actual_height, "rawData": raw_block}


def main():  
    load_dotenv()
    logging.basicConfig(level=logging.INFO)
    eth_manager = ETHBlockHeaderManager(  
        database_name=os.getenv('DB_NAME'),  
        host=os.getenv('DB_HOST'),  
        port=int(os.getenv('DB_PORT', '3306')),
        user=os.getenv('DB_USER'),  
        password=os.getenv('DB_PASS'),
        logger=logging.getLogger("LCL")
    )
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"status": False, "message": "请提供区块高度参数"}))
            sys.exit(1)

        requested_height = int(sys.argv[1])
        if requested_height == -1:
            requested_height = eth_manager.getGenesisHeight_API()
        
        block_data = eth_manager.get_block_header(requested_height)
        if block_data:  
            actual_height = int(block_data.get('height', requested_height))
            params_bytes = actual_height.to_bytes(32, byteorder='big')
            encoded_params = "0x" + str(block_data["rawData"]).removeprefix("0x")
            raw_header_bytes = bytes.fromhex(str(block_data['rawData']).removeprefix("0x"))
            key_shadow_block = decode_hex(str(block_data['hash']))
            raw_genesis = "0x" + (key_shadow_block + params_bytes).hex()
            relay_payload = eth_manager.get_shadow_payload_RPC(actual_height)
            print(json.dumps({  
                "status": True,  
                "hash": block_data['hash'],  
                "raw": raw_genesis,  
                "rawHeader": "0x" + raw_header_bytes.hex(),
                "rawRelay": relay_payload,
                "rawValidators": encoded_params,
                "height": actual_height,
                "requested_height": requested_height
            }))  
        else:  
            print(json.dumps({  
                "status": False,  
                "message": "Unable to retrieve block data"  
            }))  
    except Exception as e:  
        print(json.dumps({  
            "status": False,  
            "message": str(e)  
        }))  

if __name__ == '__main__':  
    main()
