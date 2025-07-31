"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { authenticated, user, login, logout, address } = useAuth();

  return (
    <header className="border-b border-gray-500 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-white">
            Fusion Jar
          </Link>
          <nav className="flex space-x-8">
            <Link href="/create" className="text-gray-500 hover:text-white">
              Create Investment
            </Link>
            <Link href="/portfolio" className="text-gray-500 hover:text-white">
              Portfolio
            </Link>
            <Link href="/analytics" className="text-gray-500 hover:text-white">
              Analytics
            </Link>
            <Link
              href="/gamification"
              className="text-gray-500 hover:text-white"
            >
              Gamification
            </Link>
            <Link href="/resolvers" className="text-gray-500 hover:text-white">
              Resolvers
            </Link>
            <Link href="/scheduler" className="text-gray-500 hover:text-white">
              Scheduler
            </Link>
            <Link
              href="/gasless-swap"
              className="text-gray-500 hover:text-white"
            >
              Gasless Swap
            </Link>
            <Link href="/wallet" className="text-gray-500 hover:text-white">
              Wallet
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  {user?.email || user?.phone || "User"}
                </div>
                {address && (
                  <div className="text-xs text-gray-500">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="bg-purple text-white px-4 py-2 rounded-lg hover:bg-purple-dark text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="bg-purple text-white px-4 py-2 rounded-lg hover:bg-purple-dark text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
