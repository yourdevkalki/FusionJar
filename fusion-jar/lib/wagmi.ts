import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, base } from "wagmi/chains";

// For development, we'll use a simple configuration without WalletConnect
// In production, you'll need to get a real project ID from https://cloud.walletconnect.com/
export const config = getDefaultConfig({
  appName: "Fusion Jar",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, base],
  ssr: true,
});
