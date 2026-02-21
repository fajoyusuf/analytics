import "dotenv/config";
import { runWeTrackedSync } from "../src/lib/sync/wetracked-sync";

async function main() {
  const result = await runWeTrackedSync();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
