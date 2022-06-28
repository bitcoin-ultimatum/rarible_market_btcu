// SPDX-License-Identifier: MIT

pragma solidity >=0.6.9 <0.8.0;

import "../roles/OperatorRole.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/SafeERC20Upgradeable.sol";

contract ERC20TransferProxy is Initializable, OperatorRole {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    function __ERC20TransferProxy_init() external initializer {
        __Ownable_init();
    }

    function erc20safeTransferFrom(IERC20Upgradeable token, address from, address to, uint256 value) external onlyOperator {
        token.safeTransferFrom(from, to, value);
    }
}
