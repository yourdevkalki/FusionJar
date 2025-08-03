import { Web3 } from "web3";
import { ChainBalance, SUPPORTED_CHAINS, USDC_DECIMALS } from "./types";

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

/**
 * Check USDC balance on a specific chain
 */
export async function checkChainBalance(
  chainId: number,
  userAddress: string
): Promise<ChainBalance | null> {
  try {
    const chainConfig =
      SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
    if (!chainConfig) {
      console.warn(`Unsupported chain ID: ${chainId}`);
      return null;
    }

    const web3 = new Web3(chainConfig.rpcUrl);
    const contract = new web3.eth.Contract(ERC20_ABI, chainConfig.usdcAddress);

    const balance = await contract.methods.balanceOf(userAddress).call();
    const balanceFormatted = Number(balance || 0) / Math.pow(10, USDC_DECIMALS);

    console.log(
      `💰 ${chainConfig.name} USDC balance: ${balanceFormatted} USDC`
    );

    return {
      chainId,
      chainName: chainConfig.name,
      usdcAddress: chainConfig.usdcAddress,
      balance: (balance || 0).toString(),
      balanceFormatted,
      rpcUrl: chainConfig.rpcUrl,
    };
  } catch (error) {
    console.error(`❌ Error checking balance on chain ${chainId}:`, error);
    return null;
  }
}

/**
 * Check USDC balances across all supported chains
 */
export async function checkAllChainBalances(
  userAddress: string
): Promise<ChainBalance[]> {
  console.log(
    `🔍 Checking USDC balances for ${userAddress} across all chains...`
  );

  const chainIds = Object.keys(SUPPORTED_CHAINS).map(Number);
  const balancePromises = chainIds.map((chainId) =>
    checkChainBalance(chainId, userAddress)
  );

  const results = await Promise.all(balancePromises);
  const validBalances = results.filter(
    (balance): balance is ChainBalance => balance !== null
  );

  const totalBalance = validBalances.reduce(
    (sum, balance) => sum + balance.balanceFormatted,
    0
  );
  console.log(
    `💎 Total USDC across all chains: ${totalBalance.toFixed(2)} USDC`
  );

  return validBalances;
}

/**
 * Find the best chain to execute from based on amount needed and target chain
 */
export function findBestSourceChain(
  balances: ChainBalance[],
  amountNeededUSD: number,
  targetChain: number
): ChainBalance | null {
  // Filter chains with sufficient balance
  const sufficientBalances = balances.filter(
    (balance) => balance.balanceFormatted >= amountNeededUSD
  );

  if (sufficientBalances.length === 0) {
    console.log(
      `❌ No chain has sufficient balance for ${amountNeededUSD} USD`
    );
    return null;
  }

  // Prefer same chain if available (for Fusion swaps)
  const sameChainBalance = sufficientBalances.find(
    (balance) => balance.chainId === targetChain
  );

  if (sameChainBalance) {
    console.log(
      `✅ Found same-chain balance on ${sameChainBalance.chainName} for Fusion swap`
    );
    return sameChainBalance;
  }

  // Otherwise, pick the chain with the highest balance (for Fusion+ swaps)
  const bestChain = sufficientBalances.reduce((best, current) =>
    current.balanceFormatted > best.balanceFormatted ? current : best
  );

  console.log(
    `✅ Using ${bestChain.chainName} with ${bestChain.balanceFormatted} USDC for Fusion+ swap`
  );
  return bestChain;
}

/**
 * Determine if we should use Fusion (same chain) or Fusion+ (cross-chain)
 */
export function determineSwapType(
  sourceChain: number,
  targetChain: number
): "fusion" | "fusion-plus" {
  if (sourceChain === targetChain) {
    console.log(`🔄 Using Fusion swap (same chain: ${sourceChain})`);
    return "fusion";
  } else {
    console.log(`🌉 Using Fusion+ swap (${sourceChain} → ${targetChain})`);
    return "fusion-plus";
  }
}

/**
 * Convert USD amount to USDC token amount (considering 6 decimals)
 */
export function usdToUsdcAmount(usdAmount: number): string {
  return (usdAmount * Math.pow(10, USDC_DECIMALS)).toString();
}
