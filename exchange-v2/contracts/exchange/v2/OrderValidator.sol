// SPDX-License-Identifier: MIT

pragma solidity >=0.6.9 <0.8.0;

import "../../lib/ERC1271.sol";
import "./LibOrder.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/drafts/EIP712Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

abstract contract OrderValidator is Initializable, ContextUpgradeable, ReentrancyGuardUpgradeable, EIP712Upgradeable {
    using ECDSAUpgradeable for bytes32;
    using AddressUpgradeable for address;
    
    // bytes4(keccak256("isValidSignature(bytes32,bytes)")
    bytes4 constant internal MAGICVALUE = 0x1626ba7e;

    function __OrderValidator_init_unchained() internal initializer {
        __EIP712_init_unchained("Exchange", "2");
    }

    function getChainId() external view returns (uint256 chainId) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        // solhint-disable-next-line no-inline-assembly
        assembly {
            chainId := chainid()
        }
    }

    function validate(LibOrder.Order memory order, LibOrder.Sig memory sig) internal view {
        if (_msgSender() != order.maker) {
            bytes32 hash = LibOrder.hashToSign(order);

            // require(ecrecover(hash, sig.v, sig.r, sig.s) == order.maker, "OrderValidator:: Signer is not valid");          
            require(btc_ecrecover(btcu_message_hash(hash), sig.v, sig.r, sig.s) == order.maker, "OrderValidator:: Signer is not valid");          
        }
    }

    function btcu_message_hash(bytes32 msgh) public view returns(bytes32) {
        uint256[1] memory retval;
        uint256[1] memory input;
        input[0] = uint256(msgh);

        uint256 success;

        assembly {
            success := staticcall(not(0),0x86,input,0x80,retval, 32)
        }
         
        if (success != 1) {
            return 0x0;
        }

        return bytes32(retval[0]);
    }

    function btc_ecrecover(bytes32 msgh, uint8 v, bytes32 r, bytes32 s) internal view returns(address) {
        uint256[4] memory input;
        input[0] = uint256(msgh);
        input[1] = v;
        input[2] = uint256(r);
        input[3] = uint256(s);
        uint256[1] memory retval;
        uint256 success;
        assembly {
            success := staticcall(not(0),0x85,input,0x80,retval, 32)
        }
        
        if (success != 1) {
            return address(0);
        }
        
        return address(uint160(retval[0]));
    }

    uint256[50] private __gap;
}
