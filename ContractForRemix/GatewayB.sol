// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// Custom interface for the wrapped token (WTKA)
interface IWrappedToken {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

contract GatewayB is Ownable {
    IWrappedToken public wrappedToken;

    event AssetMinted(address indexed user, uint256 amount, uint256 timestamp);
    event AssetBurned(address indexed user, uint256 amount, uint256 timestamp);

    // Pass the wrapped token address and initial owner to the constructor
    constructor(address _wrappedTokenAddress, address _initialOwner) Ownable(_initialOwner) {
        wrappedToken = IWrappedToken(_wrappedTokenAddress);
    }

    function mintAsset(address user, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");

        // Mint wrapped tokens to the user
        wrappedToken.mint(user, amount);

        // Emit event
        emit AssetMinted(user, amount, block.timestamp);
    }

    function burnAsset(address user, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");

        // Burn wrapped tokens from the user
        wrappedToken.burn(amount);

        // Emit event
        emit AssetBurned(user, amount, block.timestamp);
    }
}