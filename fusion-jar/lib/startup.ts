import { investmentScheduler } from "./scheduler";

export async function initializeServices() {
  try {
    console.log("Initializing FusionJar services...");

    // Start the investment scheduler
    await investmentScheduler.start();

    console.log("✅ All services initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing services:", error);
  }
}

// Auto-initialize when this module is imported
if (typeof window === "undefined") {
  // Only run on server side
  initializeServices();
}
