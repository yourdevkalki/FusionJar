import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const config = {
      hasApiKey: !!process.env.INCH_API_KEY,
      hasWebNodeUrl: !!process.env.WEB3_NODE_URL,
      hasAlchemyKey: !!process.env.ALCHEMY_API_KEY,
      apiKeyLength: process.env.INCH_API_KEY?.length || 0,
      nodeUrl: process.env.WEB3_NODE_URL
        ? process.env.WEB3_NODE_URL.substring(0, 30) + "..."
        : "Not configured",
      timestamp: new Date().toISOString(),
    };

    const recommendations = [];

    if (!config.hasApiKey) {
      recommendations.push({
        issue: "Missing 1inch API Key",
        solution:
          "Get API key from https://portal.1inch.dev/ and add INCH_API_KEY to .env.local",
      });
    }

    if (!config.hasWebNodeUrl && !config.hasAlchemyKey) {
      recommendations.push({
        issue: "Missing Web3 Node URL",
        solution:
          "Add WEB3_NODE_URL or ALCHEMY_API_KEY to .env.local for Fusion SDK",
      });
    }

    const status =
      config.hasApiKey && (config.hasWebNodeUrl || config.hasAlchemyKey)
        ? "ready"
        : "needs_setup";

    return NextResponse.json({
      status,
      config,
      recommendations,
      setupInstructions: {
        step1: "Create .env.local file in fusion-jar directory",
        step2: "Add INCH_API_KEY=your_api_key_here",
        step3:
          "Add WEB3_NODE_URL=your_rpc_url or ALCHEMY_API_KEY=your_alchemy_key",
        step4: "Restart the development server",
        getApiKey: "https://portal.1inch.dev/",
        getRpcUrl: "https://dashboard.alchemy.com/ or https://infura.io/",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check configuration",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
