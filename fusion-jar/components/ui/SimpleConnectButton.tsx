"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";

export function SimpleConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (connector: any) => {
    setIsConnecting(true);
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => handleConnect(connector)}
          disabled={isConnecting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isConnecting ? "Connecting..." : `Connect ${connector.name}`}
        </button>
      ))}
    </div>
  );
}
