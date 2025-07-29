import { NextRequest } from "next/server";

export function getUserAddress(request: NextRequest): string | null {
  // Get user address from request headers (set by wallet provider)
  const userAddress = request.headers.get("x-user-address");

  if (!userAddress) {
    return null;
  }

  // Basic validation for Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    return null;
  }

  return userAddress.toLowerCase();
}

export function requireAuth(request: NextRequest): string {
  const userAddress = getUserAddress(request);

  if (!userAddress) {
    throw new Error("Authentication required");
  }

  return userAddress;
}

export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
