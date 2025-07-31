import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  createEmbeddedWalletRecord,
  getUserWallets,
} from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const user = await authenticateUser(authHeader);
    const wallets = await getUserWallets(user.privyId);

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const user = await authenticateUser(authHeader);
    const body = await request.json();
    const { privyWalletId, walletAddress, chainId = 1 } = body;

    if (!privyWalletId || !walletAddress) {
      return NextResponse.json(
        { error: "privyWalletId and walletAddress are required" },
        { status: 400 }
      );
    }

    const wallet = await createEmbeddedWalletRecord(
      user.privyId,
      privyWalletId,
      walletAddress,
      chainId
    );

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
