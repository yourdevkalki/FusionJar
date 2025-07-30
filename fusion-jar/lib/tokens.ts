import { TokenInfo } from "@/types/investment";

export const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum", symbol: "ETH" },
  { id: 137, name: "Polygon", symbol: "MATIC" },
  { id: 56, name: "BNB Smart Chain", symbol: "BSC" },
  { id: 8453, name: "Base", symbol: "ETH" },
];

export const TOKENS: TokenInfo[] = [
  // Ethereum tokens
  {
    address: "0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
  },
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png",
  },
  {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png",
  },
  {
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png",
  },

  // Polygon tokens
  {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 137,
    logoURI:
      "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
  },
  {
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    chainId: 137,
    logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
  },
  {
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    symbol: "WMATIC",
    name: "Wrapped MATIC",
    decimals: 18,
    chainId: 137,
    logoURI:
      "https://assets.coingecko.com/coins/images/14073/thumb/matic_logo.png",
  },
  {
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    chainId: 137,
    logoURI:
      "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png",
  },

  // BSC tokens
  {
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18,
    chainId: 56,
    logoURI:
      "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
  },
  {
    address: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 18,
    chainId: 56,
    logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
  },
  {
    address: "0xbb4CdB9CBd36B01bD1cBaEF2AF378a649ca0F3F4",
    symbol: "WBNB",
    name: "Wrapped BNB",
    decimals: 18,
    chainId: 56,
    logoURI: "https://assets.coingecko.com/coins/images/12591/thumb/bnb.png",
  },
  {
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    symbol: "CAKE",
    name: "PancakeSwap Token",
    decimals: 18,
    chainId: 56,
    logoURI:
      "https://assets.coingecko.com/coins/images/12632/thumb/IMG_0440.PNG",
  },

  // Base tokens
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    chainId: 8453,
    logoURI:
      "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png",
  },
  {
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    chainId: 8453,
    logoURI:
      "https://assets.coingecko.com/coins/images/9956/thumb/4943.png",
  },
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
    chainId: 8453,
    logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png",
  },
  {
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
    chainId: 8453,
    logoURI:
      "https://assets.coingecko.com/coins/images/27045/thumb/cbeth.png",
  }
];

export const getTokensByChain = (chainId: number): TokenInfo[] => {
  return TOKENS.filter((token) => token.chainId === chainId);
};

export const getTokenByAddress = (
  address: string,
  chainId: number
): TokenInfo | undefined => {
  return TOKENS.find(
    (token) =>
      token.address.toLowerCase() === address.toLowerCase() &&
      token.chainId === chainId
  );
};

export const getChainById = (chainId: number) => {
  return SUPPORTED_CHAINS.find((chain) => chain.id === chainId);
};
