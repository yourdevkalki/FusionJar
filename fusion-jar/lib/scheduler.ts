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
  fee_tolerance: number;
  frequency: string;
  status: string;
  user_signature?: string;
  signature_timestamp?: string;
  signature_expiry?: string;
}

class InvestmentScheduler {
  private static instance: InvestmentScheduler;
  private isRunning: boolean = false;
  private cronJobs: cron.ScheduledTask[] = [];

  private constructor() {}

  static getInstance(): InvestmentScheduler {
    if (!InvestmentScheduler.instance) {
      InvestmentScheduler.instance = new InvestmentScheduler();
    }
    return InvestmentScheduler.instance;
  }

  async start() {
    if (this.isRunning) {
      console.log("Investment Scheduler is already running");
      return;
    }

    this.isRunning = true;
    console.log("Starting Investment Scheduler...");

    // Daily investments at 9 AM UTC
    const dailyJob = cron.schedule("0 9 * * *", async () => {
      console.log("Running daily investment scheduler...");
      await this.processScheduledInvestments("daily");
    });

    // Weekly investments on Monday at 9 AM UTC
    const weeklyJob = cron.schedule("0 9 * * 1", async () => {
      console.log("Running weekly investment scheduler...");
      await this.processScheduledInvestments("weekly");
    });

    // Health check every hour
    const healthJob = cron.schedule("0 * * * *", () => {
      console.log("Scheduler health check - Running normally");
    });

    this.cronJobs = [dailyJob, weeklyJob, healthJob];
    console.log("Investment Scheduler started successfully");
  }

  async stop() {
    if (!this.isRunning) {
      console.log("Investment Scheduler is not running");
      return;
    }

    this.cronJobs.forEach((job) => job.stop());
    this.cronJobs = [];
    this.isRunning = false;
    console.log("Investment Scheduler stopped");
  }

  private async processScheduledInvestments(frequency: "daily" | "weekly") {
    try {
      console.log(`Processing ${frequency} investments...`);

      // Get all active investments for this frequency
      const { data: investments, error } = await supabase
        .from("investment_intents")
        .select("*")
        .eq("frequency", frequency)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching investments:", error);
        return;
      }

      if (!investments || investments.length === 0) {
        console.log(`No ${frequency} investments found`);
        return;
      }

      console.log(
        `Found ${investments.length} ${frequency} investments to process`
      );

      // Process each investment
      for (const investment of investments) {
        await this.processInvestmentIntent(investment);
      }
    } catch (error) {
      console.error(`Error processing ${frequency} investments:`, error);
    }
  }

  private async processInvestmentIntent(intent: ScheduledInvestment) {
    try {
      console.log(
        `Processing investment ${intent.id} for user ${intent.user_address}`
      );

      // Check if we should skip this execution
      if (await this.shouldSkipExecution(intent)) {
        console.log(`Skipping investment ${intent.id} - conditions not met`);
        return;
      }

      // Check if user has provided a valid signature
      if (
        !intent.user_signature ||
        !intent.signature_timestamp ||
        !intent.signature_expiry
      ) {
        console.log(
          `Investment ${intent.id} has no valid signature - skipping`
        );
        return;
      }

      // Check if signature has expired
      const now = new Date();
      const expiry = new Date(intent.signature_expiry);
      if (now > expiry) {
        console.log(`Investment ${intent.id} signature has expired - skipping`);
        return;
      }

      // Execute the investment
      const result = await executeInvestment(intent);

      if (result.success) {
        console.log(`Investment ${intent.id} executed successfully`);

        // Update gamification data
        await updateGamificationData(intent.user_address, {
          type: "investment_executed",
          amount: intent.amount_usd,
        });
      } else {
        console.error(`Investment ${intent.id} failed:`, result.error);
      }
    } catch (error) {
      console.error(`Error processing investment ${intent.id}:`, error);
    }
  }

  private async shouldSkipExecution(
    intent: ScheduledInvestment
  ): Promise<boolean> {
    // Add your custom logic here to determine if execution should be skipped
    // For example:
    // - Check if user has sufficient balance
    // - Check if market conditions are favorable
    // - Check if user has paused the investment

    // For now, we'll just check if the investment is paused
    if (intent.status !== "active") {
      return true;
    }

    return false;
  }

  async triggerExecution(frequency: "daily" | "weekly") {
    console.log(`Manually triggering ${frequency} execution...`);
    await this.processScheduledInvestments(frequency);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: this.cronJobs.length,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const investmentScheduler = InvestmentScheduler.getInstance();
