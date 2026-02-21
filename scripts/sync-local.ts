import "dotenv/config";
import { runLocalSync } from "../src/lib/sync/local-sync";

async function main() {
  const result = await runLocalSync();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
