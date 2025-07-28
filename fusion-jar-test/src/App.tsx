import React, { useState } from "react";
import Web3 from "web3";
import {
  SDK,
  NetworkEnum,
  HashLock,
  PresetEnum,
  OrderStatus,
  PrivateKeyProviderConnector,
} from "@1inch/cross-chain-sdk";
import "./App.css";

// Configuration - replace these with your actual values
const ETH_RPC =
  "https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"; // Replace with your RPC
const BRIDGE_API_KEY = "{BRIDGE_API_KEY}"; // Replace with your API key
const SRC_CHAIN = NetworkEnum.ETHEREUM;
const DST_CHAIN = NetworkEnum.POLYGON; // Changed from NEAR to POLYGON (supported chain)
const SRC_TOKEN = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH on Ethereum
const DST_TOKEN = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH on Polygon

const App: React.FC = () => {
  const [status, setStatus] = useState<string>("Ready to connect");
  const [ethAddress, setEthAddress] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [swapAmount, setSwapAmount] = useState<string>("1");

  const connectWallets = async () => {
    try {
      setStatus("Connecting wallet...");

      // Connect Ethereum (MetaMask)
      if (!(window as any).ethereum) {
        throw new Error("MetaMask not found! Please install MetaMask.");
      }

      const web3 = new Web3((window as any).ethereum);
      await (window as any).ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      const ethAddr = accounts[0];
      setEthAddress(ethAddr);
      setIsConnected(true);
      setStatus("Wallet connected! Ready to swap.");
    } catch (err: any) {
      console.error(err);
      setStatus("Error connecting wallet: " + (err.message || err.toString()));
    }
  };

  const onSwap = async () => {
    if (!isConnected) {
      setStatus("Please connect wallets first!");
      return;
    }

    try {
      setStatus("Initializing swap...");

      // Connect ETH
      const web3 = new Web3((window as any).ethereum);
      const accounts = await web3.eth.getAccounts();
      const ethAddr = accounts[0];

      setStatus("Fetching quote...");

      // Setup SDK with proper Web3ProviderConnector
      const web3Provider = {
        eth: {
          call: async (transactionConfig: any) => {
            return await web3.eth.call(transactionConfig);
          },
          getChainId: async () => {
            return await web3.eth.getChainId();
          },
        },
        extend: () => web3Provider,
        // Add required methods for the SDK
        signTypedData: async (address: string, typedData: any) => {
          return await (window as any).ethereum.request({
            method: "eth_signTypedData_v4",
            params: [address, JSON.stringify(typedData)],
          });
        },
        ethCall: async (transactionConfig: any) => {
          return await web3.eth.call(transactionConfig);
        },
      };

      const sdk = new SDK({
        url: "http://localhost:3002/api/fusion-plus",
        authKey: BRIDGE_API_KEY,
        blockchainProvider: web3Provider,
      });

      // For cross-chain swaps, we might need to use a different approach
      // Let's check if we need to use the cross-chain specific endpoints

      // Calculate amount in wei
      const decimals = 18; // ETH decimals
      const amount = (parseFloat(swapAmount) * 10 ** decimals).toString();

      // Check ETH balance before proceeding
      const ethBalance = await web3.eth.getBalance(ethAddr);
      console.log(
        "ETH Balance:",
        web3.utils.fromWei(ethBalance, "ether"),
        "ETH"
      );
      console.log(
        "Required amount:",
        web3.utils.fromWei(amount, "ether"),
        "WETH (will wrap ETH)"
      );

      if (BigInt(ethBalance) < BigInt(amount)) {
        throw new Error(
          `Insufficient ETH balance. You have ${web3.utils.fromWei(
            ethBalance,
            "ether"
          )} ETH, but need ${web3.utils.fromWei(
            amount,
            "ether"
          )} ETH to wrap to WETH for this swap.`
        );
      }

      // Check if we need to wrap ETH to WETH
      const wethContract = new web3.eth.Contract(
        [
          {
            constant: true,
            inputs: [{ name: "_owner", type: "address" }],
            name: "balanceOf",
            outputs: [{ name: "balance", type: "uint256" }],
            type: "function",
          },
          {
            constant: false,
            inputs: [],
            name: "deposit",
            outputs: [],
            payable: true,
            stateMutability: "payable",
            type: "function",
          },
        ],
        SRC_TOKEN
      );

      const wethBalance = (await wethContract.methods
        .balanceOf(ethAddr)
        .call()) as string;
      console.log(
        "Current WETH Balance:",
        web3.utils.fromWei(wethBalance, "ether"),
        "WETH"
      );

      // If we don't have enough WETH, we need to wrap ETH
      if (BigInt(wethBalance) < BigInt(amount)) {
        const ethToWrap = BigInt(amount) - BigInt(wethBalance);
        console.log(
          "Need to wrap",
          web3.utils.fromWei(ethToWrap.toString(), "ether"),
          "ETH to WETH"
        );

        setStatus("Wrapping ETH to WETH...");

        // Wrap ETH to WETH
        await wethContract.methods.deposit().send({
          from: ethAddr,
          value: ethToWrap.toString(),
          gas: "100000",
        });

        console.log("Successfully wrapped ETH to WETH");
        setStatus("ETH wrapped to WETH successfully!");
      }

      const quote = await sdk.getQuote({
        amount,
        srcChainId: SRC_CHAIN,
        dstChainId: DST_CHAIN,
        srcTokenAddress: SRC_TOKEN,
        dstTokenAddress: DST_TOKEN,
        walletAddress: ethAddr,
        enableEstimate: true,
      });

      // Convert BigInt values to strings for logging
      const quoteForLogging = JSON.parse(
        JSON.stringify(quote, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      console.log("Quote received:", quoteForLogging);
      console.log("Quote presets:", quote.presets);
      console.log("Available presets:", Object.keys(quote.presets));

      setStatus("Creating order...");
      // Try using medium preset instead of fast for cross-chain swaps
      const preset = PresetEnum.medium;
      const secrets = Array.from({
        length: quote.presets[preset].secretsCount,
      }).map(
        () =>
          "0x" +
          crypto
            .getRandomValues(new Uint8Array(32))
            .reduce((s, b) => s + b.toString(16).padStart(2, "0"), "")
      );
      const hashLock =
        secrets.length === 1
          ? HashLock.forSingleFill(secrets[0])
          : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));
      const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

      // For cross-chain swaps, we might need to use a different order creation method
      const { hash, quoteId, order } = await sdk.createOrder(quote, {
        walletAddress: ethAddr,
        hashLock,
        preset,
        source: "fusion-demo",
        secretHashes,
      });

      console.log("Created order:", { hash, quoteId, order });
      console.log("Quote:", quote);

      // Convert BigInt values to strings for JSON serialization
      const orderForLogging = JSON.parse(
        JSON.stringify(order, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      console.log("Order details:", JSON.stringify(orderForLogging, null, 2));

      setStatus("Submitting order...");

      // For cross-chain swaps, we might need to use a different method
      // Let's try submitting to the cross-chain endpoint
      try {
        // Try submitting to the cross-chain specific endpoint
        await sdk.submitOrder(quote.srcChainId, order, quoteId, secretHashes);
      } catch (submitError: any) {
        console.error("Submit order error:", submitError);
        console.error("Error response:", submitError.response?.data);

        // Try alternative submission method for cross-chain
        if (submitError.response?.status === 400) {
          setStatus(
            "Cross-chain order submission failed. This might require a different approach."
          );
          throw new Error(
            "Cross-chain order submission failed. The 1inch Fusion+ API might require a different approach for cross-chain swaps."
          );
        }
        throw submitError;
      }

      setStatus("Order submitted! Monitoring status...");

      // Monitor order status
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds

      while (attempts < maxAttempts) {
        const ready = await sdk.getReadyToAcceptSecretFills(hash);
        for (const f of ready.fills) {
          await sdk.submitSecret(hash, secrets[f.idx]);
          setStatus(`Submitted secret index ${f.idx}`);
        }

        const st = await sdk.getOrderStatus(hash);
        if (
          [
            OrderStatus.Executed,
            OrderStatus.Expired,
            OrderStatus.Refunded,
          ].includes(st.status)
        ) {
          setStatus(`Final status: ${st.status}`);
          break;
        }

        attempts++;
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (attempts >= maxAttempts) {
        setStatus("Order monitoring timeout. Check order status manually.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err.message || err.toString()));
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Fusion+ API Test</h1>
        <p>Test cross-chain swap from ETH to Polygon using 1inch Fusion+</p>

        <div className="config-section">
          <h3>Configuration</h3>
          <p>
            <strong>Source:</strong> {SRC_TOKEN} (WETH on Ethereum)
          </p>
          <p>
            <strong>Destination:</strong> {DST_TOKEN} (WETH on Polygon)
          </p>
          <p>
            <strong>API Key:</strong> {BRIDGE_API_KEY ? "✅ Set" : "❌ Missing"}
          </p>
        </div>

        <div className="wallet-section">
          <h3>Wallet Connection</h3>
          {!isConnected ? (
            <button onClick={connectWallets} className="btn btn-primary">
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-info">
              <p>
                <strong>ETH:</strong> {ethAddress}
              </p>
            </div>
          )}
        </div>

        <div className="swap-section">
          <h3>Swap Configuration</h3>
          <div className="input-group">
            <label>Amount (USD):</label>
            <input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              min="0.1"
              step="0.1"
              disabled={!isConnected}
            />
          </div>

          <button
            onClick={onSwap}
            className="btn btn-success"
            disabled={!isConnected}
          >
            Start Swap
          </button>
        </div>

        <div className="status-section">
          <h3>Status</h3>
          <div className="status-display">{status}</div>
        </div>

        <div className="notes">
          <h3>Important Notes</h3>
          <ul>
            <li>Make sure you have sufficient ETH balance on Ethereum</li>
            <li>ETH will be automatically wrapped to WETH before the swap</li>
            <li>MetaMask must be connected to Ethereum mainnet</li>
            <li>This is a test on mainnet - use small amounts only</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
