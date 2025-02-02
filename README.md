# **Cross-Chain Asset Transfer Application**

This application allows users to lock assets on the Sepolia network and mint corresponding wrapped tokens on the Amoy network. It uses smart contracts deployed on both networks to facilitate cross-chain asset transfers.

---

## **Features**
- **Connect Wallet**: Connect your MetaMask wallet to interact with the application.
- **Lock Assets**: Lock assets (e.g., RKB tokens) on the Sepolia network.
- **Mint Wrapped Tokens**: Mint wrapped tokens (e.g., WTKA) on the Amoy network based on the locked assets.
- **Transfer History**: View a detailed history of all transactions, including hashes, timestamps, senders, receivers, and amounts.
- **Automatic Network Switching**: Automatically switches between Sepolia and Amoy networks during the minting process.

---

## **Prerequisites**
Before running the application, ensure you have the following:
1. **MetaMask Wallet**: Install the [MetaMask browser extension](https://metamask.io/).
2. **Test Tokens**:
   - Obtain test ETH on the Sepolia network from a faucet (e.g., [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)).
   - Obtain test MATIC on the Amoy network from a faucet (e.g., [Polygon Amoy Faucet](https://faucet.polygon.technology/)).
3. **Node.js**: Ensure Node.js is installed on your system. Download it from [here](https://nodejs.org/).

---

## **Installation**

### 1. Clone the Repository
```
https://github.com/Rushilz98/Crossbridge.git
```

## Step 3: Configure Constants
Before running the application, you need to configure the constants in the app.js file with your specific contract addresses, token addresses, and RPC URLs. Follow these steps:

1. Open the app.js file in your project directory.
2. Locate the USER_CONSTANTS object at the top of the file

```const USER_CONSTANTS = {
    GATEWAY_A_ADDRESS: "0xYourAdress", // Replace with your GatewayA address
    GATEWAY_B_ADDRESS: "0xYourAdress", // Replace with your GatewayB address
    RKB_TOKEN_ADDRESS: "0xYourAdress", // Replace with your RKB token address
    SEPOLIA_RPC_URL: "https://eth-sepolia.g.alchemy.com/v2/YourAdress", // Sepolia RPC URL
    AMOY_CHAIN_ID: "0x13882", // Amoy chain ID (hexadecimal)
    SEPOLIA_CHAIN_ID: "0xaa36a7", // Sepolia chain ID (hexadecimal)
};
```
3. Replace the placeholder values with your actual details:
   - GatewayA Address : The address of the GatewayA contract deployed on the Sepolia network.
   - GatewayB Address : The address of the GatewayB contract deployed on the Amoy network.
   - RKB Token Address : The address of the RKB token contract deployed on the Sepolia network.
   - Sepolia RPC URL : Your Alchemy or Infura RPC URL for the Sepolia network.
   - Chain IDs : Ensure the hexadecimal chain IDs for Amoy (0x13882) and Sepolia (0xaa36a7) are correct.
4.Save the changes to the app.js file.

Note : If you don't have the required contract addresses or RPC URLs, deploy the smart contracts on the respective networks and obtain the addresses. 

## 4. Run the Application
Start a local development server (if applicable) or open the index.html file in your browser:


# Usage
   ## 1. Connect Wallet
   Click the "Connect Wallet" button to connect your MetaMask wallet.
   Ensure your wallet is connected to either the Sepolia or Amoy network.
  ## 2. Lock Assets
   Enter the token address and amount you wish to lock on the Sepolia network.
   Click "Lock Asset" to initiate the locking process.
   The application will automatically approve and lock the specified amount of tokens.
   ## 3. Mint Wrapped Tokens
   Enter the amount of wrapped tokens you wish to mint on the Amoy network.
   Click "Mint Asset" to initiate the minting process.
   The application will:
   Switch to the Amoy network.
   Mint the wrapped tokens.
   Switch back to the Sepolia network to deduct the locked balance.
   ## 4. View Transfer History
   All transactions (locks and mints) are logged in the Transfer History table, including transaction hashes, timestamps, senders, receivers, and amounts.


   ## Smart Contract Addresses

| Contract    | Network | Address |
|------------|---------|----------------------------------|
| **Gateway A** | Sepolia | `0xC17484a02F2D19AB4EA43D2B2071d20cf0f46B22` |
| **Gateway B** | Amoy    | `0xDcb72b55b59b7869eF7E8b154CCA1792E624BD6d` |
| **RKB Token** | Sepolia | `0x3EF14641FaE9536C79Abe78cBF78316e6749C557` |
| **WHTK Token** | Amoy | `0x1CD0f3a9132159d48fBC7036527b2845E0B99eC9` |

## Troubleshooting

### 1. Network Switching Issues  
- If the application fails to switch networks automatically, manually switch to the required network (**Sepolia** or **Amoy**) in MetaMask.  

### 2. Insufficient Funds  
- Ensure you have sufficient **test ETH** on **Sepolia** and **test MATIC** on **Amoy** to cover gas fees.  

### 3. Transaction Failures  
- Check the **console logs** for detailed error messages.  
- Ensure the **contract addresses** and **RPC URLs** are correctly configured.

## License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- **Ethers.js** for interacting with Ethereum-based networks.  
- **MetaMask** for wallet connectivity.  
- **Alchemy** and **Polygon** for RPC endpoints.  

