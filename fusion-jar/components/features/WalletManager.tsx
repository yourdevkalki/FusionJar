"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import toast from "react-hot-toast";

export function WalletManager() {
  const { authenticated, user, createEmbeddedWallet, authenticatedFetch } =
    useAuth();
  const [isCreating, setIsCreating] = useState(false);

  let wallets: any[] = [];
  try {
    const walletsData = useWallets();
    wallets = walletsData.wallets || [];
  } catch (error) {
    console.warn("useWallets not available");
  }

  const handleCreateWallet = async () => {
    if (!authenticated) {
      toast.error("Please login first");
      return;
    }

    setIsCreating(true);
    try {
      // Create the embedded wallet via Privy
      await createEmbeddedWallet();

      // Wait a moment for the wallet to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the newly created wallet
      const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === "privy"
      );

      if (embeddedWallet) {
        // Store wallet info in Supabase
        await authenticatedFetch("/api/auth/wallet", {
          method: "POST",
          body: JSON.stringify({
            privyWalletId: embeddedWallet.id,
            walletAddress: embeddedWallet.address,
            chainId: embeddedWallet.chainId,
          }),
        });

        toast.success("Embedded wallet created successfully!");
      }
    } catch (error) {
      console.error("Failed to create wallet:", error);
      toast.error("Failed to create wallet");
    } finally {
      setIsCreating(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="p-6 bg-background rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Wallet Management</h2>
        <p className="text-gray-500">Please login to manage your wallets.</p>
      </div>
    );
  }

  const embeddedWallets = wallets.filter(
    (wallet) => wallet.walletClientType === "privy"
  );
  const externalWallets = wallets.filter(
    (wallet) => wallet.walletClientType !== "privy"
  );

  return (
    <div className="p-6 bg-background rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Wallet Management</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Embedded Wallets</h3>
        {embeddedWallets.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">No embedded wallets found</p>
            <button
              onClick={handleCreateWallet}
              disabled={isCreating}
              className="bg-purple text-white px-4 py-2 rounded-lg hover:bg-purple-dark disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Embedded Wallet"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {embeddedWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">{wallet.address}</p>
                  <p className="text-sm text-gray-500">
                    Chain ID: {wallet.chainId}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {externalWallets.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Connected Wallets</h3>
          <div className="space-y-3">
            {externalWallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg"
              >
                <div>
                  <p className="font-medium">{wallet.address}</p>
                  <p className="text-sm text-gray-500">
                    {wallet.walletClientType}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Connected
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-purple rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          About Embedded Wallets
        </h4>
        <p className="text-sm text-blue-800">
          Embedded wallets are created and managed by Privy. They provide a
          seamless experience without requiring external wallet connections.
          Private keys are securely managed by Privy and cannot be accessed
          programmatically.
        </p>
      </div>
    </div>
  );
}
