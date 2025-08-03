"use client";

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { useMemo } from "react";
import dynamic from "next/dynamic";

function PrivyProviderInner({ children }: { children: React.ReactNode }) {
  // Get the app ID from environment variables
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'demo-app-id';
  
  // Memoize configuration to prevent re-renders that might cause key issues
  const config = useMemo(() => ({
    loginMethods: ["email", "sms", "wallet"],
    appearance: {
      theme: "light",
      accentColor: "#676FFF",
      showWalletLoginFirst: false,
    },
    embeddedWallets: {
      createOnLogin: "users-without-wallets",
    },
  }), []);

  return (
    <PrivyProviderBase appId={appId} config={config}>
      {children}
    </PrivyProviderBase>
  );
}

// Dynamically import to prevent SSR issues
export const PrivyProvider = dynamic(() => Promise.resolve(PrivyProviderInner), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
