"use client";

import { useState, useEffect } from "react";
import { useAccount, useSignTypedData, useSendTransaction } from "wagmi";
import { toast } from "react-hot-toast";
import { SUPPORTED_CHAINS, TOKENS } from "../../lib/tokens";

interface Quote {
  dstAmount: string;
  estimatedGas?: string;
  protocols?: any[];
  fusionQuote?: any;
  preset?: string;
  auctionStartAmount?: string;
  auctionEndAmount?: string;
}

interface SwapOrder {
  id: string;
  status: string;
  phase: string;
  orderData?: any;
  orderHash?: string;
  message?: string;
  timestamp?: number;
  isFusion?: boolean;
  txData?: any;
  approvalTx?: any;
  needsApproval?: boolean;
  originalParams?: any;
  requiresUserConfirmation?: boolean;
}

interface OrderStatus {
  orderHash: string;
  status: string;
  phase: string;
  message: string;
  fills?: any[];
  timestamp: number;
  isFusion?: boolean;
}

export default function GaslessSwap() {
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [selectedSrcToken, setSelectedSrcToken] = useState(
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  ); // USDC
  const [selectedDstToken, setSelectedDstToken] = useState(
    "0x4200000000000000000000000000000000000006"
  ); // WETH
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [swapOrder, setSwapOrder] = useState<SwapOrder | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [swapStatus, setSwapStatus] = useState<
    | "idle"
    | "quoting"
    | "creating"
    | "signing"
    | "submitting"
    | "executing"
    | "monitoring"
    | "success"
    | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const { signTypedDataAsync } = useSignTypedData();
  const { sendTransactionAsync } = useSendTransaction();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Monitor order status when we have an order
  useEffect(() => {
    if (
      swapOrder?.orderHash &&
      swapStatus === "monitoring" &&
      swapOrder.isFusion
    ) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `/api/investments/status?orderHash=${swapOrder.orderHash}&chainId=8453`
          );
          if (response.ok) {
            const statusData = await response.json();
            setOrderStatus(statusData);

            // Update swap status based on order phase
            if (
              statusData.phase === "withdrawal" ||
              statusData.status === "Filled"
            ) {
              setSwapStatus("success");
              toast.success("🎉 Fusion+ swap completed successfully!");
              clearInterval(interval);
            } else if (
              statusData.phase === "expired" ||
              statusData.phase === "cancelled"
            ) {
              setSwapStatus("error");
              setError(statusData.message);
              toast.error(`Order ${statusData.phase}: ${statusData.message}`);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Error monitoring order status:", error);
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [swapOrder?.orderHash, swapStatus, swapOrder?.isFusion]);

  const getPhaseText = () => {
    if (!orderStatus) return "";

    if (orderStatus.isFusion) {
      switch (orderStatus.phase) {
        case "announcement":
          return "📢 Phase 1: Dutch auction in progress - resolvers competing";
        case "deposit":
          return "🏦 Phase 2: Resolver depositing assets to escrow contracts";
        case "withdrawal":
          return "🔓 Phase 3: Unlocking assets and completing swap";
        default:
          return orderStatus.message || "";
      }
    } else {
      return "⚡ Regular 1inch swap - confirm transaction in wallet";
    }
  };

  const getStatusText = () => {
    switch (swapStatus) {
      case "quoting":
        return "Getting 1inch quote...";
      case "creating":
        return "Creating swap order...";
      case "signing":
        return "Sign the order to proceed...";
      case "submitting":
        return "Submitting to 1inch network...";
      case "executing":
        if (swapOrder?.needsApproval) {
          return "Approving token and executing swap...";
        }
        return "Executing transaction...";
      case "monitoring":
        return orderStatus ? getPhaseText() : "Monitoring swap progress...";
      case "success":
        return "🎉 Swap completed successfully!";
      case "error":
        return "❌ Swap failed - try again";
      default:
        return "Ready for 1inch swap";
    }
  };

  const getQuote = async () => {
    if (!isConnected || !address || !amount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    setSwapStatus("quoting");
    setError(null);

    try {
      const response = await fetch("/api/investments/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          src: selectedSrcToken,
          dst: selectedDstToken,
          amount: (parseFloat(amount) * Math.pow(10, 6)).toString(), // USDC has 6 decimals
          from: address,
          chainId: 8453, // Base chain
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get quote");
      }

      const data = await response.json();
      setQuote(data.quote);
      toast.success("1inch quote received!");
    } catch (error) {
      console.error("Quote error:", error);
      setError(error instanceof Error ? error.message : "Failed to get quote");
      toast.error("Failed to get quote");
    } finally {
      setSwapStatus("idle");
    }
  };

  const executeSwap = async () => {
    if (!isConnected || !address || !amount || !quote) {
      toast.error("Please connect wallet, enter amount, and get quote first");
      return;
    }

    setSwapStatus("creating");
    setError(null);

    try {
      // Step 1: Create swap order (tries Fusion+ first, falls back to regular swap)
      const createResponse = await fetch("/api/investments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          src: selectedSrcToken,
          dst: selectedDstToken,
          amount: (parseFloat(amount) * Math.pow(10, 6)).toString(),
          from: address,
          chainId: 8453,
          preset: "auto",
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create swap order");
      }

      const order: SwapOrder = await createResponse.json();
      setSwapOrder(order);
      console.log("Created swap order:", order);

      if (order.isFusion) {
        // Fusion+ flow - needs signing
        setSwapStatus("signing");

        const domain = {
          name: "1inch Fusion+",
          version: "1",
          chainId: 8453,
          verifyingContract:
            "0x1111111254EEB25477B68fb85Ed929f73A960582" as `0x${string}`,
        };

        const types = {
          Order: [
            { name: "salt", type: "uint256" },
            { name: "makerAsset", type: "address" },
            { name: "takerAsset", type: "address" },
            { name: "makingAmount", type: "uint256" },
            { name: "takingAmount", type: "uint256" },
            { name: "maker", type: "address" },
          ],
        } as const;

        const makingAmount = (parseFloat(amount) * Math.pow(10, 6)).toString();
        const takingAmount = quote.dstAmount || "0";
        const salt =
          order.orderData?.order?.salt?.toString() || Date.now().toString();

        const message = {
          salt: salt,
          makerAsset: selectedSrcToken as `0x${string}`,
          takerAsset: selectedDstToken as `0x${string}`,
          makingAmount: makingAmount,
          takingAmount: takingAmount,
          maker: address as `0x${string}`,
        };

        const signature = await signTypedDataAsync({
          domain,
          types,
          primaryType: "Order",
          message,
        });

        // Submit Fusion+ order
        setSwapStatus("submitting");
        const submitResponse = await fetch("/api/investments/execute-gasless", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderData: order.orderData,
            signature: signature,
            userAddress: address,
          }),
        });

        if (!submitResponse.ok) {
          throw new Error("Failed to submit Fusion+ order");
        }

        const result = await submitResponse.json();
        setSwapOrder((prev) =>
          prev ? { ...prev, orderHash: result.orderHash } : null
        );
        setSwapStatus("monitoring");
        toast.success("Fusion+ order submitted to Dutch auction!");
      } else if (order.needsApproval) {
        // Handle approval step
        setSwapStatus("executing");

        if (!order.approvalTx) {
          throw new Error("No approval transaction data received");
        }

        console.log("Executing approval transaction:", order.approvalTx);
        toast("Please approve token spending in your wallet...", {
          icon: "ℹ️",
          duration: 4000,
        });

        const approvalTxHash = await sendTransactionAsync({
          to: order.approvalTx.to as `0x${string}`,
          data: order.approvalTx.data as `0x${string}`,
          value: BigInt(order.approvalTx.value || 0),
          gas: BigInt(
            order.approvalTx.gasPrice
              ? "200000"
              : order.approvalTx.gas || "200000"
          ),
        });

        console.log("Approval transaction sent:", approvalTxHash);
        toast.success("Token approved! Now executing swap...");

        // Wait a moment for approval to be mined
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Now execute the actual swap with original parameters
        const swapResponse = await fetch("/api/investments/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            src: selectedSrcToken,
            dst: selectedDstToken,
            amount: (parseFloat(amount) * Math.pow(10, 6)).toString(),
            from: address,
            chainId: 8453,
            preset: "auto",
          }),
        });

        if (!swapResponse.ok) {
          throw new Error("Failed to create swap after approval");
        }

        const swapOrder = await swapResponse.json();

        if (swapOrder.txData || swapOrder.tx) {
          const txData = swapOrder.txData || swapOrder.tx;
          const swapTxHash = await sendTransactionAsync({
            to: txData.to as `0x${string}`,
            data: txData.data as `0x${string}`,
            value: BigInt(txData.value || 0),
            gas: BigInt(txData.gas || 0),
          });

          console.log("Swap transaction sent:", swapTxHash);
          setSwapStatus("success");
          toast.success("🎉 1inch swap executed successfully!");
          setSwapOrder((prev) =>
            prev ? { ...prev, orderHash: swapTxHash } : null
          );
        } else {
          throw new Error("No swap transaction data received after approval");
        }
      } else {
        // Regular 1inch swap - execute transaction directly
        setSwapStatus("executing");

        if (!order.txData) {
          throw new Error("No transaction data received");
        }

        console.log("Executing regular 1inch swap:", order.txData);

        const txHash = await sendTransactionAsync({
          to: order.txData.to as `0x${string}`,
          data: order.txData.data as `0x${string}`,
          value: BigInt(order.txData.value || 0),
          gas: BigInt(order.txData.gas || 0),
        });

        console.log("Transaction sent:", txHash);
        setSwapStatus("success");
        toast.success("🎉 1inch swap executed successfully!");

        // Update order with transaction hash
        setSwapOrder((prev) => (prev ? { ...prev, orderHash: txHash } : null));
      }
    } catch (error) {
      console.error("Swap error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to execute swap"
      );
      setSwapStatus("error");
      toast.error("Failed to execute swap");
    }
  };

  const resetForm = () => {
    setAmount("");
    setQuote(null);
    setSwapOrder(null);
    setOrderStatus(null);
    setSwapStatus("idle");
    setError(null);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Wallet to Use 1inch Swap
          </h2>
          <p className="text-gray-500">
            Please connect your wallet to start swapping tokens with 1inch.
          </p>
        </div>
      </div>
    );
  }

  const baseTokens = TOKENS.filter((token) => token.chainId === 8453);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-md mx-auto bg-background rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            1inch Swap on Base
          </h2>
          <p className="text-gray-500">
            {swapOrder?.isFusion
              ? "Experience gasless Fusion+ swaps with MEV protection"
              : "Fast and efficient token swaps using 1inch"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Source Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              From Token
            </label>
            <select
              value={selectedSrcToken}
              onChange={(e) => setSelectedSrcToken(e.target.value)}
              disabled={swapStatus !== "idle"}
              className="w-full p-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent disabled:bg-gray-500"
            >
              {baseTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              To Token
            </label>
            <select
              value={selectedDstToken}
              onChange={(e) => setSelectedDstToken(e.target.value)}
              disabled={swapStatus !== "idle"}
              className="w-full p-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent disabled:bg-gray-500"
            >
              {baseTokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={swapStatus !== "idle"}
              className="w-full p-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple focus:border-transparent disabled:bg-gray-500"
            />
          </div>

          {/* Status Display */}
          <div className="text-center py-4">
            <div
              className={`text-sm font-medium ${
                swapStatus === "success"
                  ? "text-green"
                  : swapStatus === "error"
                  ? "text-red-600"
                  : swapStatus !== "idle"
                  ? "text-purple"
                  : "text-gray-500"
              }`}
            >
              {getStatusText()}
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>

          {/* Swap Type Indicator */}
          {swapOrder && (
            <div
              className={`text-center p-3 rounded-lg ${
                swapOrder.isFusion ? "bg-purple-50" : "bg-purple"
              }`}
            >
              <div
                className={`font-medium ${
                  swapOrder.isFusion ? "text-purple-800" : "text-blue-800"
                }`}
              >
                {swapOrder.isFusion
                  ? "⚡ Fusion+ Swap"
                  : "🔄 Regular 1inch Swap"}
              </div>
              <div
                className={`text-xs ${
                  swapOrder.isFusion ? "text-purple-600" : "text-purple"
                }`}
              >
                {swapOrder.isFusion
                  ? "Gasless • MEV Protected • Dutch Auction"
                  : "Direct execution • Standard fees"}
              </div>
            </div>
          )}

          {/* Phase Progress Indicator - Only for Fusion+ */}
          {orderStatus && orderStatus.isFusion && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">
                Fusion+ Progress
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      orderStatus.phase === "announcement"
                        ? "bg-purple-500 animate-pulse"
                        : "bg-green0"
                    }`}
                  ></div>
                  <span className="text-sm text-purple-800">
                    Phase 1: Announcement (Dutch Auction)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      orderStatus.phase === "deposit"
                        ? "bg-purple-500 animate-pulse"
                        : orderStatus.phase === "withdrawal"
                        ? "bg-green0"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-purple-800">
                    Phase 2: Deposit (Escrow)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      orderStatus.phase === "withdrawal"
                        ? "bg-purple-500 animate-pulse"
                        : orderStatus.status === "Filled"
                        ? "bg-green0"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm text-purple-800">
                    Phase 3: Withdrawal (Complete)
                  </span>
                </div>
              </div>
              <div className="text-xs text-purple-600 mt-2">
                {orderStatus.message}
              </div>
            </div>
          )}

          {/* Quote Preview */}
          {quote && (
            <div className="bg-background p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">Quote Preview</h3>
              <div className="text-sm text-gray-500 space-y-1">
                <div>
                  You will receive:{" "}
                  {parseFloat(quote.dstAmount) / Math.pow(10, 18)} WETH
                </div>
                {quote.estimatedGas && (
                  <div>Estimated gas: {quote.estimatedGas}</div>
                )}
                <div className="text-green font-medium">
                  ✅ Best rates via 1inch aggregation
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={getQuote}
              disabled={swapStatus !== "idle" || !amount}
              className="w-full bg-purple text-white py-3 px-4 rounded-lg hover:bg-purple-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Get 1inch Quote
            </button>

            <button
              onClick={executeSwap}
              disabled={swapStatus !== "idle" || !quote}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            >
              Execute Swap
            </button>

            {(swapStatus === "success" || swapStatus === "error") && (
              <button
                onClick={resetForm}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                New Swap
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
