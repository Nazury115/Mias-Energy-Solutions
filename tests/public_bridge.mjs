// Invoke the shipped TypeScript module, not a test-only copy of its logic.
import { pathToFileURL } from "node:url";
const module = await import(pathToFileURL(process.argv[2]).href);
process.stdout.write(JSON.stringify(module[process.argv[3]](...JSON.parse(process.argv[4]))));
