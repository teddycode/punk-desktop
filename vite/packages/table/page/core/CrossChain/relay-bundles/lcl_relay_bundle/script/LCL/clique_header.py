"""Strict local validation matching the fixed-signer LCL v2 header contract."""
import rlp
from eth_keys import keys
from eth_utils import keccak

SIGNER = bytes.fromhex('040ab1cce91aa43981cb430ce9ed5a48866c7dee')

def validate_header(raw, height):
    f = rlp.decode(raw, strict=True)
    if not isinstance(f, list) or len(f) != 15 or any(not isinstance(x, bytes) for x in f):
        raise ValueError('Expected flat 15-field pre-London header')
    sizes = {0:32, 1:32, 2:20, 3:32, 4:32, 5:32, 6:256, 13:32, 14:8}
    if any(len(f[i]) != n for i,n in sizes.items()):
        raise ValueError('Invalid fixed-width header field')
    for i in range(7,12):
        if len(f[i]) > 8 or (f[i] and f[i][0] == 0):
            raise ValueError('Non-canonical integer')
    num = lambda i: int.from_bytes(f[i], 'big')
    if num(8) != height or f[1] != keccak(rlp.encode([])) or f[2] != bytes(20) or f[13] != bytes(32) or f[14] != bytes(8):
        raise ValueError('Wrong height, uncle hash, mix hash, or signer vote')
    if not 5000 <= num(9) <= 2**63-1 or num(10) > num(9) or num(7) != (1 if height == 0 else 2):
        raise ValueError('Invalid gas or difficulty')
    extra = f[12]
    epoch = height % 30000 == 0
    if len(extra) != (117 if epoch else 97) or (epoch and extra[32:52] != SIGNER):
        raise ValueError('Wrong Clique extraData or epoch signer')
    if height == 0:
        if f[0] != bytes(32) or extra[-65:] != bytes(65):
            raise ValueError('Invalid genesis')
    else:
        unsigned = f.copy(); unsigned[12] = extra[:-65]
        signature = keys.Signature(signature_bytes=extra[-65:])
        if signature.recover_public_key_from_msg_hash(keccak(rlp.encode(unsigned))).to_canonical_address() != SIGNER:
            raise ValueError('Unauthorized Clique signer')
    return f, keccak(raw)
