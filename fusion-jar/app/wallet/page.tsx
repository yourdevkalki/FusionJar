import { WalletManager } from "@/components/features/WalletManager";

export default function WalletPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Wallet Management
        </h1>
        <p className="text-gray-500">
          Manage your embedded wallets and connected accounts with Privy
          authentication.
        </p>
      </div>

      <WalletManager />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">Privy Authentication</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• Email, SMS, or wallet-based login</li>
            <li>• Secure JWT token authentication</li>
            <li>• Automatic user creation in Supabase</li>
            <li>• Row Level Security (RLS) enforcement</li>
          </ul>
        </div>

        <div className="bg-background p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">Embedded Wallets</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>• Auto-created for new users</li>
            <li>• No private key access (secure by design)</li>
            <li>• Multi-chain support</li>
            <li>• Seamless transaction signing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
