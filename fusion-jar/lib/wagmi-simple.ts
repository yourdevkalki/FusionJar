import { http, createConfig } from "wagmi";
import { mainnet, polygon, base } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

// Simple configuration for development without WalletConnect
export const config = createConfig({
  chains: [mainnet, polygon, base],
  connectors: [injected(), metaMask()],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
});
