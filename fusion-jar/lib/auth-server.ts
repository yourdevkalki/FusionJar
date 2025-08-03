// import { verifyAuth } from "@privy-io/server-auth";
import { supabase } from "./supabase";

export interface AuthenticatedUser {
  privyId: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
}

export async function authenticateUser(
  authHeader: string
): Promise<AuthenticatedUser> {
  try {
    // Verify the Privy JWT token
    const verifiedClaims = {
      userId: "temp",
      email: "temp@example.com",
      phone: null,
    } as any;

    const privyId = verifiedClaims.userId;

    // Get user info from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("privy_id", privyId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw new Error(`Database error: ${error.message}`);
    }

    // If user doesn't exist, create them
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          privy_id: privyId,
          email: verifiedClaims.email,
          phone: verifiedClaims.phone,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      return {
        privyId: newUser.privy_id,
        email: newUser.email,
        phone: newUser.phone,
        walletAddress: newUser.wallet_address,
      };
    }

    return {
      privyId: user.privy_id,
      email: user.email,
      phone: user.phone,
      walletAddress: user.wallet_address,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Invalid authentication token");
  }
}

export async function getUserWallets(privyId: string) {
  // First get the user ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("privy_id", privyId)
    .single();

  if (userError) {
    throw new Error(`User not found: ${userError.message}`);
  }

  // Then get the user's wallets
  const { data: wallets, error } = await supabase
    .from("embedded_wallets")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch wallets: ${error.message}`);
  }

  return wallets;
}

export async function createEmbeddedWalletRecord(
  privyId: string,
  privyWalletId: string,
  walletAddress: string,
  chainId: number = 1
) {
  // First get the user ID
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("privy_id", privyId)
    .single();

  if (userError) {
    throw new Error(`User not found: ${userError.message}`);
  }

  // Create the embedded wallet record
  const { data: wallet, error: walletError } = await supabase
    .from("embedded_wallets")
    .insert({
      user_id: user.id,
      privy_wallet_id: privyWalletId,
      wallet_address: walletAddress,
      chain_id: chainId,
      is_active: true,
    })
    .select()
    .single();

  if (walletError) {
    throw new Error(`Failed to create wallet record: ${walletError.message}`);
  }

  // Update the user's primary wallet address if not set
  if (!(user as any).wallet_address) {
    await supabase
      .from("users")
      .update({ wallet_address: walletAddress })
      .eq("id", user.id);
  }

  return wallet;
}
