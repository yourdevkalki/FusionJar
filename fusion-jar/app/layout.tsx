import type { Metadata } from "next";
import "./globals.css";
import { PrivyProvider } from "@/components/providers/PrivyProvider";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

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
      <body className="font-sans">
        <PrivyProvider>
          <WalletProvider>
            <Navbar />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              }}
            />
          </WalletProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
