"use client";

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  // Get the app ID from environment variables
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'demo-app-id';
  
  // Minimal configuration to avoid errors
  const config = {
    loginMethods: ["email", "sms", "wallet"] as const,
    appearance: {
      theme: "light" as const,
      accentColor: "#676FFF",
      showWalletLoginFirst: false,
    },
    embeddedWallets: {
      createOnLogin: "users-without-wallets" as const,
    },
  };

  return (
    <PrivyProviderBase appId={appId} config={config}>
      {children}
    </PrivyProviderBase>
  );
}
