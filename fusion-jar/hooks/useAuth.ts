import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [primaryWallet, setPrimaryWallet] = useState<any>(null);

  // Always call Privy hooks - they handle their own internal state
  let privyData: any = {};
  let walletsData: any = {};

  try {
    privyData = usePrivy();
    walletsData = useWallets();
  } catch (error) {
    // Hooks were called, but Privy context is not available
    console.warn("Privy context not available");
  }

  const {
    authenticated = false,
    user = null,
    login = () => console.warn("Privy not configured"),
    logout = () => console.warn("Privy not configured"),
    ready = true,
    createWallet = () => Promise.resolve(),
  } = privyData;

  const { wallets = [] } = walletsData;

  // Get the primary embedded wallet
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === "privy"
      );
      setPrimaryWallet(embeddedWallet || wallets[0]);
    } else {
      setPrimaryWallet(null);
    }
  }, [wallets]);

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!authenticated || !user) {
        throw new Error("User not authenticated");
      }

      const headers = {
        "Content-Type": "application/json",
        "x-privy-id": user.id,
        "x-user-address": primaryWallet?.address || "",
        ...options.headers,
      };

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [authenticated, user, primaryWallet]
  );

  const createEmbeddedWallet = useCallback(async () => {
    if (!authenticated) {
      throw new Error("User must be authenticated to create wallet");
    }

    if (!createWallet) {
      throw new Error("Privy wallet creation not available");
    }

    try {
      await createWallet();
    } catch (error) {
      console.error("Failed to create embedded wallet:", error);
      throw error;
    }
  }, [authenticated, createWallet]);

  return {
    // Authentication state
    authenticated,
    user,
    ready,

    // Wallet state
    primaryWallet,
    wallets,
    address: primaryWallet?.address,
    isConnected: authenticated && !!primaryWallet,

    // Actions
    login,
    logout,
    createEmbeddedWallet,
    authenticatedFetch,
  };
}
