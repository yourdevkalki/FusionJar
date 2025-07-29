"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const SimpleConnectButton = dynamic(
  () =>
    import("@/components/ui/SimpleConnectButton").then((mod) => ({
      default: mod.SimpleConnectButton,
    })),
  { ssr: false }
);

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Fusion Jar
          </Link>
          <nav className="flex space-x-8">
            <Link href="/create" className="text-gray-700 hover:text-gray-900">
              Create Investment
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-700 hover:text-gray-900"
            >
              Portfolio
            </Link>
            <Link
              href="/analytics"
              className="text-gray-700 hover:text-gray-900"
            >
              Analytics
            </Link>
            <Link
              href="/gamification"
              className="text-gray-700 hover:text-gray-900"
            >
              Gamification
            </Link>
            <Link
              href="/resolvers"
              className="text-gray-700 hover:text-gray-900"
            >
              Resolvers
            </Link>
            <Link
              href="/scheduler"
              className="text-gray-700 hover:text-gray-900"
            >
              Scheduler
            </Link>
          </nav>
          <SimpleConnectButton />
        </div>
      </div>
    </header>
  );
}
