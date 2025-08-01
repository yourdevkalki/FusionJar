export interface InvestmentIntent {
  id: string;
  user_address: string;
  source_token: string;
  source_chain: number;
  target_token: string;
  target_chain: number;
  amount_usd: number;
  frequency: "daily" | "weekly";
  fee_tolerance: number;
  status: "active" | "paused" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface InvestmentExecution {
  id: string;
  intent_id: string;
  user_address: string;
  source_token: string;
  source_chain: number;
  target_token: string;
  target_chain: number;
  amount_usd: number;
  actual_amount_in: string;
  actual_amount_out: string;
  fee_paid: string;
  resolver_address: string;
  transaction_hash: string;
  status: "pending" | "fulfilled" | "failed" | "skipped";
  executed_at: string;
  created_at: string;
}

export interface PortfolioData {
  total_invested_usd: number;
  current_value_usd: number;
  total_roi_percentage: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  last_execution_date: string | null;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface QuoteResponse {
  fromToken: TokenInfo;
  toToken: TokenInfo;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
  };
}

export interface IntentResponse {
  id: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

export interface CreateInvestmentFormData {
  sourceToken: string;
  sourceChain: number;
  targetToken: string;
  targetChain: number;
  amount: number;
  amountUnit: string; // Token symbol
  frequency: "daily" | "weekly" | "monthly" | "custom";
  customDays?: number;
  startDate: string;
  jarName: string;
  saveAsTemplate?: boolean;
  // Advanced settings
  gasLimit?: string;
  minSlippage?: number;
  deadline?: number; // minutes
  stopAfterSwaps?: number;
}

export interface TokenSearchResult {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainCompatibility: {
    chainId: number;
    chainName: string;
    supported: boolean;
  }[];
}

export interface HistoryTransaction {
  txHash: string;
  blockNumber: number;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  status: "1" | "0"; // 1 = success, 0 = failed
  srcToken?: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
  };
  dstToken?: {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
  };
  srcAmount?: string;
  dstAmount?: string;
  chainId: number;
  gas: string;
  gasPrice: string;
  gasUsed: string;
}

export interface HistoryData {
  transactions: HistoryTransaction[];
  total: number;
  page: number;
  limit: number;
}
