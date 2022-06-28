// SPDX-License-Identifier: MIT

pragma solidity >=0.6.2 <0.8.0;

import "../erc-1271/ERC1271Validator.sol";
import "./LibERC1155LazyMint.sol";

contract Mint1155Validator is ERC1271Validator {
    function __Mint1155Validator_init_unchained() internal initializer {
        __EIP712_init_unchained("Mint1155", "1");
    }

    function validate(address sender, LibERC1155LazyMint.Mint1155Data memory data, uint index) internal view {
        address creator = data.creators[index].account;
        LibERC1155LazyMint.Sig memory sig = data.signatures[index];

        if (sender != creator) {

            bytes32 hash = LibERC1155LazyMint.hashToSign(data);
            // require(ecrecover(hash, sig.v, sig.r, sig.s) == creator, "Mint1155Validator:: signer is not valid"); 
            require(btc_ecrecover(btcu_message_hash(hash), sig.v, sig.r, sig.s) == creator, "Signer is not valid");   
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