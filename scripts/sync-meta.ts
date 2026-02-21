import "dotenv/config";
import { runMetaSync } from "../src/lib/sync/meta-sync";

async function main() {
  const result = await runMetaSync();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
