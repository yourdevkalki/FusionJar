"use client";

import GaslessSwap from "@/components/features/GaslessSwap";

export default function GaslessSwapPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Gasless Swap on Base
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of DeFi with gasless token swaps using 1inch
            Fusion+ on Base chain. No gas fees, instant execution, and seamless
            user experience.
          </p>
        </div>

        <GaslessSwap
          onSuccess={() => {
            console.log("Gasless swap completed successfully!");
          }}
        />

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              How Gasless Swaps Work
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Get Quote</h3>
                <p className="text-sm text-gray-600">
                  Select your tokens and get a real-time quote from 1inch
                  Fusion+
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Sign Intent</h3>
                <p className="text-sm text-gray-600">
                  Sign the swap intent with your wallet - no gas fees required
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Execute</h3>
                <p className="text-sm text-gray-600">
                  Resolvers execute your swap and you receive tokens instantly
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Why Base Chain?
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Ultra-low fees compared to Ethereum mainnet</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Fast transaction confirmation times</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Ethereum L2 security with Coinbase backing</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Growing DeFi ecosystem with major protocols</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
