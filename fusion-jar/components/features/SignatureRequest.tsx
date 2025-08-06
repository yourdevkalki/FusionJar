"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { createExecutionMessage } from "@/lib/investment-executor";

interface SignatureRequestProps {
  intent: {
    id: string;
    user_address: string;
    source_token: string;
    source_chain: number;
    target_token: string;
    target_chain: number;
    amount_usd: number;
    fee_tolerance: number;
  };
  onSignatureComplete: (
    signature: string,
    timestamp: string,
    expiry: string
  ) => void;
  onCancel: () => void;
}

export default function SignatureRequest({
  intent,
  onSignatureComplete,
  onCancel,
}: SignatureRequestProps) {
  const { address } = useAccount();
  const { signMessage, isPending } = useSignMessage();
  const [error, setError] = useState<string | null>(null);

  const handleSignMessage = async () => {
    if (!address) {
      setError("Please connect your wallet first");
      return;
    }

    if (address.toLowerCase() !== intent.user_address.toLowerCase()) {
      setError("Connected wallet address doesn't match the investment intent");
      return;
    }

    try {
      setError(null);

      // Create the message to sign
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour expiry

      const message = createExecutionMessage({
        ...intent,
        signature_expiry: expiryDate.toISOString(),
      });

      // Request signature from user
      await signMessage({ message });

      // If we reach here, the signature was successful
      const timestamp = new Date().toISOString();
      onSignatureComplete("", timestamp, expiryDate.toISOString());
    } catch (err) {
      console.error("Error signing message:", err);
      setError("Failed to sign message. Please try again.");
    }
  };

  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);

  return (
    <div className="bg-background rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Authorize Investment Execution
        </h3>
        <p className="text-sm text-gray-500">
          Sign this message to authorize FusionJar to execute your scheduled
          investment
        </p>
      </div>

      <div className="bg-background rounded-lg p-4 mb-6">
        <h4 className="font-medium text-white mb-3">Investment Details:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount:</span>
            <span className="font-medium">${intent.amount_usd}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">From:</span>
            <span className="font-medium">
              {intent.source_token} (Chain {intent.source_chain})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">To:</span>
            <span className="font-medium">
              {intent.target_token} (Chain {intent.target_chain})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fee Tolerance:</span>
            <span className="font-medium">{intent.fee_tolerance}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Signature Expires:</span>
            <span className="font-medium">{expiryDate.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red border border-red rounded-lg p-3 mb-4">
          <p className="text-red text-sm">{error}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={handleSignMessage}
          disabled={isPending || !address}
          className="flex-1 bg-purple text-white px-4 py-2 rounded-lg hover:bg-purple-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Signing..." : "Sign & Authorize"}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          By signing this message, you authorize FusionJar to execute this
          investment on your behalf within the specified parameters. The
          signature will expire in 24 hours.
        </p>
      </div>
    </div>
  );
}
