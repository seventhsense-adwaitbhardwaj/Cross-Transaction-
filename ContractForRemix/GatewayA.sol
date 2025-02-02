// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GatewayA is ReentrancyGuard {
    address public owner;
    mapping(address => uint256) public lockedBalances;

    event AssetLocked(address indexed user, address indexed token, uint256 amount, uint256 timestamp);
    event AssetUnlocked(address indexed user, address indexed token, uint256 amount, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function lockAsset(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        // Transfer tokens from user to this contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Update locked balance
        lockedBalances[token] += amount;

        // Emit event for cross-chain communication
        emit AssetLocked(msg.sender, token, amount, block.timestamp);
    }

    function unlockAsset(address token, uint256 amount) external onlyOwner nonReentrant {
        require(lockedBalances[token] >= amount, "Insufficient locked balance");

        // Deduct from locked balance
        lockedBalances[token] -= amount;

        // Transfer tokens back to the owner
        IERC20(token).transfer(owner, amount);

        // Emit event
        emit AssetUnlocked(msg.sender, token, amount, block.timestamp);
    }

    function deductLockedBalance(address token, uint256 amount) external onlyOwner nonReentrant {
        require(lockedBalances[token] >= amount, "Insufficient locked balance");

        // Deduct from locked balance
        lockedBalances[token] -= amount;

        // Emit event
        emit AssetUnlocked(msg.sender, token, amount, block.timestamp);
    }
}