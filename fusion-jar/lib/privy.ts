// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PrivyProvider } from "@privy-io/react-auth";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

export const privyConfig = {
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || "demo-app-id",
  config: {
    loginMethods: ["email", "sms", "wallet"],
    appearance: {
      theme: "light",
      accentColor: "#676FFF",
      showWalletLoginFirst: false,
    },
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
    },
  },
};

export const getPrivyAppId = () => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) {
    if (isBrowser) {
      console.warn("NEXT_PUBLIC_PRIVY_APP_ID is not set. Using demo app ID.");
      return "demo-app-id";
    }
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID is not set");
  }
  return appId;
};
