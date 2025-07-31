import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from "@/components/providers/PrivyProvider";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fusion Jar",
  description: "Automate DeFi micro-investments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider>
          <WalletProvider>
            <Navbar />
            {children}
          </WalletProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
