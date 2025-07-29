import { NextRequest, NextResponse } from "next/server";
import { investmentScheduler } from "@/lib/scheduler";

export async function GET() {
  try {
    const status = investmentScheduler.getStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error getting scheduler status:", error);
    return NextResponse.json(
      { error: "Failed to get scheduler status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, frequency } = await request.json();

    switch (action) {
      case "start":
        await investmentScheduler.start();
        return NextResponse.json({ message: "Scheduler started successfully" });

      case "stop":
        await investmentScheduler.stop();
        return NextResponse.json({ message: "Scheduler stopped successfully" });

      case "trigger":
        if (!frequency || !["daily", "weekly"].includes(frequency)) {
          return NextResponse.json(
            { error: 'Invalid frequency. Must be "daily" or "weekly"' },
            { status: 400 }
          );
        }
        await investmentScheduler.triggerExecution(frequency);
        return NextResponse.json({
          message: `${frequency} execution triggered successfully`,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "start", "stop", or "trigger"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error executing scheduler action:", error);
    return NextResponse.json(
      { error: "Failed to execute scheduler action" },
      { status: 500 }
    );
  }
}
