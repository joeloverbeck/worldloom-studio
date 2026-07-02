import { serve } from "@hono/node-server";
import { randomBytes } from "node:crypto";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4173);
const hostname = process.env.HOST ?? "127.0.0.1";
const token = process.env.WORLDLOOM_TOKEN ?? randomBytes(18).toString("base64url");

serve({
  fetch: createApp({ token }).fetch,
  port,
  hostname
});

console.log(`Worldloom Studio server listening on http://${hostname}:${port}`);
console.log(`WORLDLOOM_TOKEN=${token}`);

export { createApp } from "./app.js";
export { WorldStore } from "./world-store.js";
