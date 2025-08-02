"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SUPPORTED_CHAINS } from "@/lib/tokens";
import { Wallet, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: number;
  priceUsd?: number;
  valueUsd?: number;
}

interface ChainBalances {
  chainId: number;
  chainName: string;
  tokens: TokenBalance[];
  totalValueUsd: number;
}

export function WalletBalance() {
  const { address, authenticatedFetch } = useAuth();
  const [balances, setBalances] = useState<ChainBalances[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState<number>(1); // Default to Ethereum
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchBalances();
    }
  }, [address, selectedChain]);

  const fetchBalances = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `/api/wallet/balance/${address}?chainId=${selectedChain}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.balances) {
        // Process the 1inch Balance API response
        const processedBalances: ChainBalances = {
          chainId: selectedChain,
          chainName: getChainName(selectedChain),
          tokens: processTokenBalances(data.balances),
          totalValueUsd: 0,
        };

        // Calculate total USD value
        processedBalances.totalValueUsd = processedBalances.tokens.reduce(
          (sum, token) => sum + (token.valueUsd || 0),
          0
        );

        setBalances([processedBalances]);
      } else {
        throw new Error(data.error || "Failed to fetch balances");
      }
    } catch (error) {
      console.error("Failed to fetch wallet balances:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to fetch wallet balances");
    } finally {
      setLoading(false);
    }
  };

  const processTokenBalances = (balanceData: any): TokenBalance[] => {
    if (!balanceData || typeof balanceData !== 'object') {
      return [];
    }

    const tokens: TokenBalance[] = [];

    // Handle different possible response formats from 1inch Balance API
    if (balanceData.tokens && Array.isArray(balanceData.tokens)) {
      // Format: { tokens: [...] }
      tokens.push(...balanceData.tokens.map(processTokenBalance));
    } else if (Array.isArray(balanceData)) {
      // Format: [...]
      tokens.push(...balanceData.map(processTokenBalance));
    } else {
      // Format: { tokenAddress: "balance", ... } (from curl response)
      Object.entries(balanceData).forEach(([tokenAddress, balance]: [string, any]) => {
        // Skip zero balances
        if (balance === "0" || balance === 0) {
          return;
        }

        tokens.push(processTokenBalance({
          address: tokenAddress,
          balance: balance.toString(),
          // Let processTokenBalance handle the symbol/name lookup
        }));
      });
    }

    // Filter out zero balances and sort by value
    return tokens
      .filter(token => token.balanceFormatted > 0)
      .sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0));
  };

  const processTokenBalance = (tokenData: any): TokenBalance => {
    // Handle different input formats
    let balance: string;
    let address: string;
    let decimals: number;
    let symbol: string;
    let name: string;

    if (typeof tokenData === "string") {
      // Direct balance value (legacy format)
      balance = tokenData;
      address = "";
      decimals = 18; // Default for ETH
      symbol = "ETH";
      name = "Ethereum";
    } else {
      // Object format
      balance = tokenData.balance || tokenData.toString() || "0";
      address = tokenData.address || "";
      
      // Get token info from address
      const tokenSymbol = getTokenSymbol(address);
      const tokenName = getTokenName(address);
      const tokenDecimals = getTokenDecimals(address);
      
      decimals = tokenData.decimals || tokenDecimals || 18;
      symbol = tokenData.symbol || tokenSymbol || "UNKNOWN";
      name = tokenData.name || tokenName || "Unknown Token";
    }

    const balanceFormatted = parseFloat(balance) / Math.pow(10, decimals);

    return {
      address,
      symbol,
      name,
      decimals,
      balance,
      balanceFormatted,
      priceUsd: tokenData.priceUsd || 0,
      valueUsd: balanceFormatted * (tokenData.priceUsd || 0),
    };
  };

  // Helper functions to get token info from known addresses
  const getTokenSymbol = (address: string): string => {
    const knownTokens: Record<string, string> = {
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "ETH",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
      "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
      "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
    };
    return knownTokens[address.toLowerCase()] || "";
  };

  const getTokenName = (address: string): string => {
    const knownTokens: Record<string, string> = {
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "Ethereum",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USD Coin",
      "0xdac17f958d2ee523a2206206994597c13d831ec7": "Tether USD",
      "0x6b175474e89094c44da98b954eedeac495271d0f": "Dai Stablecoin",
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "Wrapped BTC",
    };
    return knownTokens[address.toLowerCase()] || "";
  };

  const getTokenDecimals = (address: string): number => {
    const knownTokens: Record<string, number> = {
      "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": 18, // ETH
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 6,  // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7": 6,  // USDT
      "0x6b175474e89094c44da98b954eedeac495271d0f": 18, // DAI
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": 8,  // WBTC
    };
    return knownTokens[address.toLowerCase()] || 18; // Default to 18
  };

  const getChainName = (chainId: number): string => {
    const supportedChains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      8453: "Base",
      42161: "Arbitrum",
    };
    return supportedChains[chainId] || `Chain ${chainId}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTokenAmount = (amount: number, symbol: string) => {
    if (amount < 0.0001) {
      return `<0.0001 ${symbol}`;
    }
    return `${amount.toFixed(6)} ${symbol}`;
  };

  if (!address) {
    return (
      <div className="rounded-2xl bg-[var(--secondary-600)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-white" />
          <h3 className="text-xl font-bold text-white">Wallet Balance</h3>
        </div>
        <p className="text-[var(--secondary-400)]">Connect your wallet to view balances</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--secondary-600)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-white" />
          <h3 className="text-xl font-bold text-white">Wallet Balance</h3>
        </div>
        <button
          onClick={fetchBalances}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Chain Selector */}
      <div className="mb-4">
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(parseInt(e.target.value))}
          className="w-full bg-[var(--secondary-500)] border border-[var(--secondary-400)] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
        >
          <option value={1}>Ethereum</option>
          <option value={137}>Polygon</option>
          <option value={56}>BSC</option>
          <option value={8453}>Base</option>
          <option value={42161}>Arbitrum</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-[var(--secondary-500)] rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-[var(--secondary-500)] rounded w-1/2"></div>
          </div>
        </div>
      ) : balances.length > 0 ? (
        <div className="space-y-4">
          {balances.map((chainBalance) => (
            <div key={chainBalance.chainId}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">
                  {chainBalance.chainName}
                </h4>
                <span className="text-sm text-green-400">
                  Total: {formatCurrency(chainBalance.totalValueUsd)}
                </span>
              </div>

              {chainBalance.tokens.length === 0 ? (
                <p className="text-[var(--secondary-400)] text-sm">
                  No tokens found or all balances are zero
                </p>
              ) : (
                <div className="space-y-2">
                  {chainBalance.tokens.slice(0, 5).map((token) => (
                    <div
                      key={token.address}
                      className="flex items-center justify-between p-3 bg-[var(--secondary-500)] rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {token.symbol}
                        </div>
                        <div className="text-sm text-[var(--secondary-400)]">
                          {token.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-white">
                          {formatTokenAmount(token.balanceFormatted, token.symbol)}
                        </div>
                        {token.valueUsd && token.valueUsd > 0 && (
                          <div className="text-sm text-green-400">
                            {formatCurrency(token.valueUsd)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {chainBalance.tokens.length > 5 && (
                    <p className="text-sm text-[var(--secondary-400)] text-center">
                      +{chainBalance.tokens.length - 5} more tokens
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[var(--secondary-400)]">
          No balance data available. Try refreshing or select a different chain.
        </p>
      )}
    </div>
  );
}