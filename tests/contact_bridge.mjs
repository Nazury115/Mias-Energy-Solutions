// Test infrastructure only: exercise the actual module without duplicating it.
import { pathToFileURL } from "node:url";

const modulePath = process.argv[2];
const payload = JSON.parse(process.argv[3]);
const { getContactLinks } = await import(pathToFileURL(modulePath).href);
process.stdout.write(JSON.stringify(getContactLinks(payload.contacts, payload.context)));
