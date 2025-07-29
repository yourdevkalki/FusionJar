import cron from "node-cron";
import { supabase } from "./supabase";
import { executeInvestment } from "./investment-executor";
import { updateGamificationData } from "./gamification";

interface ScheduledInvestment {
  id: string;
  user_address: string;
  source_token: string;
  source_chain: number;
  target_token: string;
  target_chain: number;
  amount_usd: number;
  frequency: "daily" | "weekly";
  last_execution?: string;
}

class InvestmentScheduler {
  private static instance: InvestmentScheduler;
  private isRunning = false;

  private constructor() {}

  static getInstance(): InvestmentScheduler {
    if (!InvestmentScheduler.instance) {
      InvestmentScheduler.instance = new InvestmentScheduler();
    }
    return InvestmentScheduler.instance;
  }

  async start() {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting Investment Scheduler...");

    // Schedule daily investments at 9 AM UTC
    cron.schedule("0 9 * * *", async () => {
      console.log("Running daily investment scheduler...");
      await this.processScheduledInvestments("daily");
    });

    // Schedule weekly investments on Monday at 9 AM UTC
    cron.schedule("0 9 * * 1", async () => {
      console.log("Running weekly investment scheduler...");
      await this.processScheduledInvestments("weekly");
    });

    // Health check every hour
    cron.schedule("0 * * * *", () => {
      console.log("Scheduler health check - Running normally");
    });

    console.log("Investment Scheduler started successfully");
  }

  async stop() {
    this.isRunning = false;
    console.log("Investment Scheduler stopped");
  }

  private async processScheduledInvestments(frequency: "daily" | "weekly") {
    try {
      // Get all active investment intents for the given frequency
      const { data: intents, error } = await supabase
        .from("investment_intents")
        .select("*")
        .eq("status", "active")
        .eq("frequency", frequency);

      if (error) {
        console.error("Error fetching investment intents:", error);
        return;
      }

      console.log(
        `Processing ${intents?.length || 0} ${frequency} investments`
      );

      // Process each investment intent
      for (const intent of intents || []) {
        await this.processInvestmentIntent(intent);
      }
    } catch (error) {
      console.error("Error processing scheduled investments:", error);
    }
  }

  private async processInvestmentIntent(intent: any) {
    try {
      console.log(
        `Processing investment intent ${intent.id} for user ${intent.user_address}`
      );

      // Check if we should skip this execution based on last execution time
      if (await this.shouldSkipExecution(intent)) {
        console.log(`Skipping execution for intent ${intent.id} - too recent`);
        return;
      }

      // Execute the investment
      const executionResult = await executeInvestment(intent);

      if (executionResult.success) {
        // Update gamification data
        await updateGamificationData(intent.user_address, {
          type: "investment_executed",
          amount: intent.amount_usd,
          success: true,
        });

        console.log(`Successfully executed investment ${intent.id}`);
      } else {
        console.error(
          `Failed to execute investment ${intent.id}:`,
          executionResult.error
        );
      }
    } catch (error) {
      console.error(`Error processing investment intent ${intent.id}:`, error);
    }
  }

  private async shouldSkipExecution(intent: any): Promise<boolean> {
    // Get the last execution for this intent
    const { data: lastExecution } = await supabase
      .from("investment_executions")
      .select("created_at")
      .eq("intent_id", intent.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!lastExecution || lastExecution.length === 0) {
      return false; // No previous execution, proceed
    }

    const lastExecutionTime = new Date(lastExecution[0].created_at);
    const now = new Date();
    const hoursSinceLastExecution =
      (now.getTime() - lastExecutionTime.getTime()) / (1000 * 60 * 60);

    // Skip if less than 20 hours have passed (for daily) or 6 days (for weekly)
    const minHours = intent.frequency === "daily" ? 20 : 6 * 24;
    return hoursSinceLastExecution < minHours;
  }

  // Manual trigger for testing
  async triggerExecution(frequency: "daily" | "weekly") {
    console.log(`Manually triggering ${frequency} execution...`);
    await this.processScheduledInvestments(frequency);
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      timestamp: new Date().toISOString(),
    };
  }
}

export const investmentScheduler = InvestmentScheduler.getInstance();
