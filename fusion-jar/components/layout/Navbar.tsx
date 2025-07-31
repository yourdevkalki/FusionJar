"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { authenticated, address, logout, login } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-background border-b border-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Fusion Jar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`transition-colors ${
                isActive("/")
                  ? "text-purple-light font-semibold"
                  : "text-white hover:text-purple-light"
              }`}
            >
              Home
            </Link>
            <Link
              href="/create"
              className={`transition-colors ${
                isActive("/create")
                  ? "text-purple-light font-semibold"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Invest
            </Link>
            <Link
              href="/portfolio"
              className={`transition-colors ${
                isActive("/portfolio")
                  ? "text-purple-light font-semibold"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Portfolio
            </Link>
            <Link
              href="/profile"
              className={`transition-colors ${
                isActive("/profile")
                  ? "text-purple-light font-semibold"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              Profile
            </Link>
            <Link
              href="/history"
              className={`transition-colors ${
                isActive("/history")
                  ? "text-purple-light font-semibold"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              History
            </Link>
            {authenticated ? (
              <button
                onClick={logout}
                className="text-gray-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={login}
                className="bg-purple text-white px-4 py-2 rounded-lg hover:bg-purple-dark transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Wallet Address */}
          {authenticated && address && (
            <div className="hidden md:flex items-center space-x-2">
              <div className="bg-gray-500 px-3 py-1 rounded-full text-sm text-white">
                {address.slice(0, 6)}...{address.slice(-4)}
              </div>
              <div className="w-2 h-2 bg-green rounded-full"></div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-500">
              <Link
                href="/"
                className={`block px-3 py-2 transition-colors ${
                  isActive("/")
                    ? "text-purple-light font-semibold"
                    : "text-white hover:text-purple-light"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/create"
                className={`block px-3 py-2 transition-colors ${
                  isActive("/create")
                    ? "text-purple-light font-semibold"
                    : "text-gray-500 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Invest
              </Link>
              <Link
                href="/portfolio"
                className={`block px-3 py-2 transition-colors ${
                  isActive("/portfolio")
                    ? "text-purple-light font-semibold"
                    : "text-gray-500 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                href="/profile"
                className={`block px-3 py-2 transition-colors ${
                  isActive("/profile")
                    ? "text-purple-light font-semibold"
                    : "text-gray-500 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/history"
                className={`block px-3 py-2 transition-colors ${
                  isActive("/history")
                    ? "text-purple-light font-semibold"
                    : "text-gray-500 hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                History
              </Link>
              {authenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-500 hover:text-white transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => {
                    login();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 bg-purple text-white rounded-lg hover:bg-purple-dark transition-colors"
                >
                  Login
                </button>
              )}
              {authenticated && address && (
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-500 px-3 py-1 rounded-full text-sm text-white">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <div className="w-2 h-2 bg-green rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
