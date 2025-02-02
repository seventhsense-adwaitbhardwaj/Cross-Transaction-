document.addEventListener('DOMContentLoaded', () => {
    // ==============================
    // USER-DEFINED CONSTANTS
    // ==============================
    const USER_CONSTANTS = {
        // Gateway Contracts
        GATEWAY_A_ADDRESS: "0xC17484a02F2D19AB4EA43D2B2071d20cf0f46B22", // Replace with your GatewayA address
        GATEWAY_B_ADDRESS: "0xDcb72b55b59b7869eF7E8b154CCA1792E624BD6d", // Replace with your GatewayB address

        // Token Addresses
        RKB_TOKEN_ADDRESS: "0x3EF14641FaE9536C79Abe78cBF78316e6749C557", // Replace with your RKB token address

        // Network Providers
        SEPOLIA_RPC_URL: "https://eth-sepolia.g.alchemy.com/v2/7toxm4WYQO-pDkvb8MupEXr5PK94UwNc", // Sepolia RPC URL
        AMOY_CHAIN_ID: "0x13882", // Amoy chain ID (hexadecimal)
        SEPOLIA_CHAIN_ID: "0xaa36a7", // Sepolia chain ID (hexadecimal)
    };

    // ==============================
    // APPLICATION LOGIC
    // ==============================
    const connectWalletButton = document.getElementById('connectWallet');
    const walletStatus = document.getElementById('walletStatus');
    const lockForm = document.getElementById('lockForm');
    const mintForm = document.getElementById('mintForm');
    const transferHistoryBody = document.querySelector('#transferHistory tbody');
    const notificationArea = document.getElementById('notificationArea');
    let provider, signer, accounts;

    // Connect Wallet
    connectWalletButton.addEventListener('click', async () => {
        if (window.ethereum) {
            try {
                showLoading("Connecting wallet...");
                provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                signer = provider.getSigner();
                accounts = await provider.listAccounts();
                walletStatus.textContent = `Connected: ${accounts[0]}`;
                hideLoading();
                showNotification("Wallet connected successfully!", "success");
            } catch (error) {
                hideLoading();
                walletStatus.textContent = 'Failed to connect wallet';
                showNotification("Failed to connect wallet. Check console for details.", "error");
                console.error("Error connecting wallet:", error);
            }
        } else {
            walletStatus.textContent = 'MetaMask not detected';
            showNotification("MetaMask not detected. Please install MetaMask.", "error");
        }
    });

    // Lock Asset on Sepolia
    lockForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!provider || !signer || !accounts || accounts.length === 0) {
            showNotification("Please connect your wallet first.", "error");
            return;
        }

        const tokenAddress = document.getElementById('tokenAddress').value;
        const amount = ethers.utils.parseUnits(document.getElementById('amount').value, 18);

        try {
            showLoading("Locking asset...");
            const gatewayAABI = [
                "function lockAsset(address token, uint256 amount)",
                "function lockedBalances(address token) view returns (uint256)"
            ];
            const gatewayAContract = new ethers.Contract(USER_CONSTANTS.GATEWAY_A_ADDRESS, gatewayAABI, signer);

            // Check allowance
            const erc20ABI = [
                "function allowance(address owner, address spender) view returns (uint256)",
                "function approve(address spender, uint256 amount) returns (bool)"
            ];
            const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
            const allowance = await tokenContract.allowance(accounts[0], USER_CONSTANTS.GATEWAY_A_ADDRESS);

            if (allowance.lt(amount)) {
                const approveTx = await tokenContract.approve(USER_CONSTANTS.GATEWAY_A_ADDRESS, amount);
                await approveTx.wait();
                console.log("Approval successful");
            }

            // Lock asset
            const lockTx = await gatewayAContract.lockAsset(tokenAddress, amount);
            await lockTx.wait();
            console.log("Asset locked successfully");

            // Add to transfer history
            addTransferHistory(
                lockTx.hash,
                new Date().toLocaleString(),
                accounts[0],
                USER_CONSTANTS.GATEWAY_A_ADDRESS,
                ethers.utils.formatUnits(amount, 18)
            );

            hideLoading();
            showNotification("Asset locked successfully!", "success");
            alert("Asset locked successfully!");
        } catch (error) {
            hideLoading();
            console.error(error);
            showNotification("Failed to lock asset. Check console for details.", "error");
            alert("Failed to lock asset. Check console for details.");
        }
    });

    // Mint Asset on Amoy
    mintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!provider || !signer || !accounts || accounts.length === 0) {
            showNotification("Please connect your wallet first.", "error");
            return;
        }

        const mintAmount = ethers.utils.parseUnits(document.getElementById('mintAmount').value, 18);

        try {
            showLoading("Minting asset...");

            // GatewayB Contract Details (Amoy)
            const gatewayBABi = [
                "function mintAsset(address user, uint256 amount)"
            ];
            const amoyProvider = new ethers.providers.Web3Provider(window.ethereum); // Use MetaMask provider for Amoy
            const gatewayBContract = new ethers.Contract(USER_CONSTANTS.GATEWAY_B_ADDRESS, gatewayBABi, amoyProvider.getSigner());

            // GatewayA Contract Details (Sepolia)
            const sepoliaProvider = new ethers.providers.JsonRpcProvider(USER_CONSTANTS.SEPOLIA_RPC_URL);
            const gatewayAABI = [
                "function lockedBalances(address token) view returns (uint256)",
                "function deductLockedBalance(address token, uint256 amount)"
            ];

            // Fetch total locked RKB on Sepolia
            const gatewayAContractRead = new ethers.Contract(USER_CONSTANTS.GATEWAY_A_ADDRESS, gatewayAABI, sepoliaProvider);
            const totalLockedRKB = await gatewayAContractRead.lockedBalances(USER_CONSTANTS.RKB_TOKEN_ADDRESS);
            console.log(`Total Locked RKB on Sepolia: ${ethers.utils.formatUnits(totalLockedRKB, 18)} RKB`);

            // Validate mint amount
            if (mintAmount.gt(totalLockedRKB)) {
                hideLoading();
                showNotification(`You can only mint up to ${ethers.utils.formatUnits(totalLockedRKB, 18)} WTKA tokens.`, "error");
                alert(`You can only mint up to ${ethers.utils.formatUnits(totalLockedRKB, 18)} WTKA tokens.`);
                return;
            }

            // Switch to Amoy network
            try {
                await switchNetwork(USER_CONSTANTS.AMOY_CHAIN_ID);
            } catch (switchError) {
                hideLoading();
                console.error("Failed to switch to Amoy network:", switchError);
                showNotification("Failed to switch to Amoy network. Please switch manually.", "error");
                return;
            }

            // Fetch current gas prices
            const feeData = await amoyProvider.getFeeData();

            // Ensure the gas tip cap meets the minimum requirement
            const maxPriorityFeePerGas = ethers.utils.parseUnits("30", "gwei"); // Set to 30 Gwei
            const baseFee = feeData.maxFeePerGas; // Base fee from the network
            const maxFeePerGas = ethers.BigNumber.from(
                Math.max(
                    parseFloat(ethers.utils.formatUnits(baseFee.mul(2), 'gwei')), // Double the base fee
                    parseFloat(ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei')) // Ensure >= priority fee
                ) * 1e9 // Convert back to Wei
            );

            console.log(`Using Max Fee Per Gas: ${ethers.utils.formatUnits(maxFeePerGas, 'gwei')} Gwei`);
            console.log(`Using Max Priority Fee Per Gas: ${ethers.utils.formatUnits(maxPriorityFeePerGas, 'gwei')} Gwei`);

            // Check wallet balance
            const balance = await amoyProvider.getBalance(accounts[0]);
            console.log(`Wallet Balance: ${ethers.utils.formatEther(balance)} MATIC`);

            // Ensure sufficient funds
            const estimatedGasCost = maxFeePerGas.mul(300000); // Estimated gas cost
            if (balance.lt(estimatedGasCost)) {
                hideLoading();
                showNotification("Insufficient test MATIC in your wallet. Please request more from the faucet.", "error");
                alert("Insufficient test MATIC in your wallet. Please request more from the faucet.");
                return;
            }

            console.log("Minting WTKA tokens on Amoy...");
            const mintTx = await gatewayBContract.mintAsset(accounts[0], mintAmount, {
                maxFeePerGas: maxFeePerGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
                gasLimit: 300000, // Set a higher gas limit to avoid errors
            });
            console.log(`Transaction sent: ${mintTx.hash}`);
            await mintTx.wait();
            console.log("Minted WTKA successfully!");

            // Switch to Sepolia network to deduct locked RKB
            try {
                await switchNetwork(USER_CONSTANTS.SEPOLIA_CHAIN_ID);
            } catch (switchError) {
                hideLoading();
                console.error("Failed to switch to Sepolia network:", switchError);
                showNotification("Failed to switch to Sepolia network. Please switch manually.", "error");
                return;
            }

            // Reinitialize provider and signer for Sepolia
            const sepoliaProviderWithSigner = new ethers.providers.Web3Provider(window.ethereum);
            const sepoliaSigner = sepoliaProviderWithSigner.getSigner();
            const gatewayAContractWrite = new ethers.Contract(USER_CONSTANTS.GATEWAY_A_ADDRESS, gatewayAABI, sepoliaSigner);

            // Deduct locked RKB on Sepolia
            const deductTx = await gatewayAContractWrite.deductLockedBalance(USER_CONSTANTS.RKB_TOKEN_ADDRESS, mintAmount);
            console.log(`Deducted locked RKB on Sepolia: ${deductTx.hash}`);
            await deductTx.wait();
            console.log("Deducted locked RKB successfully!");

            // Switch back to Amoy network
            try {
                await switchNetwork(USER_CONSTANTS.AMOY_CHAIN_ID);
            } catch (switchError) {
                hideLoading();
                console.error("Failed to switch back to Amoy network:", switchError);
                showNotification("Failed to switch back to Amoy network. Please switch manually.", "error");
                return;
            }

            // Add to transfer history
            addTransferHistory(
                mintTx.hash,
                new Date().toLocaleString(),
                accounts[0],
                USER_CONSTANTS.GATEWAY_B_ADDRESS,
                ethers.utils.formatUnits(mintAmount, 18)
            );

            hideLoading();
            showNotification("Asset minted successfully!", "success");
            alert("Asset minted successfully!");
        } catch (error) {
            hideLoading();
            console.error(error);
            showNotification("Failed to mint asset. Check console for details.", "error");
            alert("Failed to mint asset. Check console for details.");
        }
    });

    // Function to Switch Networks
    async function switchNetwork(chainId) {
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId }],
            });
            console.log(`Switched to network with chainId: ${chainId}`);
        } catch (switchError) {
            // If the network is not added, prompt the user to add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: chainId,
                                chainName: chainId === USER_CONSTANTS.AMOY_CHAIN_ID ? "Amoy Testnet" : "Sepolia Testnet",
                                nativeCurrency: {
                                    name: chainId === USER_CONSTANTS.AMOY_CHAIN_ID ? "MATIC" : "ETH",
                                    symbol: chainId === USER_CONSTANTS.AMOY_CHAIN_ID ? "MATIC" : "ETH",
                                    decimals: 18,
                                },
                                rpcUrls: [chainId === USER_CONSTANTS.AMOY_CHAIN_ID ? "https://rpc-amoy.polygon.technology" : USER_CONSTANTS.SEPOLIA_RPC_URL],
                                blockExplorerUrls: [chainId === USER_CONSTANTS.AMOY_CHAIN_ID ? "https://www.oklink.com/amoy" : "https://sepolia.etherscan.io"],
                            },
                        ],
                    });
                    console.log(`Added and switched to network with chainId: ${chainId}`);
                } catch (addError) {
                    console.error("Failed to add network:", addError);
                    throw addError;
                }
            } else {
                console.error("Failed to switch network:", switchError);
                throw switchError;
            }
        }
    }

    // Add Transfer History
    function addTransferHistory(hash, timestamp, sender, receiver, amount) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${hash}</td>
            <td>${timestamp}</td>
            <td>${sender}</td>
            <td>${receiver}</td>
            <td>${amount}</td>
        `;
        transferHistoryBody.appendChild(row);
    }

    // Show Notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notificationArea.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Show Loading Indicator
    function showLoading(message) {
        const loadingBar = document.getElementById('loadingBar');
        const loadingMessage = document.getElementById('loadingMessage');
        loadingBar.style.display = 'block';
        loadingMessage.textContent = message;
    }

    // Hide Loading Indicator
    function hideLoading() {
        const loadingBar = document.getElementById('loadingBar');
        const loadingMessage = document.getElementById('loadingMessage');
        loadingBar.style.display = 'none';
        loadingMessage.textContent = '';
    }
});