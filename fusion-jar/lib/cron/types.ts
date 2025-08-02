// Types for the investment execution cron system

export interface InvestmentIntent {
  id: string;
  user_address: string;
  jar_name: string;
  amount: number; // USD amount
  frequency: string;
  target_token: string;
  target_chain: number;
  source_token: string; // Usually USDC
  source_chain: number;
  status: "active" | "paused" | "completed";
  next_execution: Date;
  created_at: Date;
}

export interface InvestmentExecution {
  id?: string;
  intent_id: string;
  user_address: string;
  source_token: string;
  source_chain: number;
  target_token: string;
  target_chain: number;
  amount_usd: number;
  actual_amount_in?: string;
  actual_amount_out?: string;
  fee_paid?: string;
  resolver_address?: string;
  transaction_hash?: string;
  status: "pending" | "fulfilled" | "failed" | "skipped";
  executed_at?: Date;
  error_message?: string;
}

export interface ChainBalance {
  chainId: number;
  chainName: string;
  usdcAddress: string;
  balance: string; // In wei (smallest unit)
  balanceFormatted: number; // In USDC (human readable)
  rpcUrl: string;
}

export interface SwapParams {
  sourceChain: number;
  targetChain: number;
  sourceToken: string;
  targetToken: string;
  amountUSD: number;
  userAddress: string;
  privateKey: string;
}

export interface SwapResult {
  success: boolean;
  transactionHash?: string;
  actualAmountIn?: string;
  actualAmountOut?: string;
  feePaid?: string;
  resolverAddress?: string;
  error?: string;
}

// Supported chains configuration
export const SUPPORTED_CHAINS = {
  1: {
    name: "Ethereum",
    rpcUrl: process.env.ETHEREUM_RPC || "https://mainnet.infura.io/v3/YOUR_KEY",
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48",
    networkEnum: 1, // NetworkEnum.ETHEREUM
  },
  137: {
    name: "Polygon",
    rpcUrl: process.env.POLYGON_RPC || "https://polygon-rpc.com",
    usdcAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    networkEnum: 137, // NetworkEnum.POLYGON
  },
  8453: {
    name: "Base",
    rpcUrl: process.env.BASE_RPC || "https://mainnet.base.org",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    networkEnum: 8453, // NetworkEnum.COINBASE
  },
  42161: {
    name: "Arbitrum",
    rpcUrl: process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc",
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    networkEnum: 42161, // NetworkEnum.ARBITRUM
  },
} as const;

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Minimum balance threshold (1 USDC)
export const MIN_BALANCE_THRESHOLD = 1 * Math.pow(10, USDC_DECIMALS);
