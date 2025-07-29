import { useAccount } from "wagmi";
import { useCallback } from "react";

export function useAuth() {
  const { address, isConnected } = useAccount();

  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const headers = {
        "Content-Type": "application/json",
        "x-user-address": address,
        ...options.headers,
      };

      return fetch(url, {
        ...options,
        headers,
      });
    },
    [address]
  );

  return {
    address,
    isConnected,
    authenticatedFetch,
  };
}
