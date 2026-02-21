import "dotenv/config";
import cron from "node-cron";
import { runLocalSync } from "../src/lib/sync/local-sync";

const expression = process.env.SYNC_CRON_EXPRESSION || "0 */6 * * *";

console.log(`Starting local sync cron with expression: ${expression}`);

cron.schedule(expression, async () => {
  console.log(`[${new Date().toISOString()}] Running sync:local`);
  try {
    const result = await runLocalSync();
    console.log(`[${new Date().toISOString()}] sync:local success`, result.counts);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] sync:local failed`, error);
  }
});
