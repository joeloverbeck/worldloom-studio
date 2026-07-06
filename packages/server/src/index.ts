import { serve } from "@hono/node-server";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4173);
const hostname = process.env.HOST ?? "127.0.0.1";

serve({
  fetch: createApp().fetch,
  port,
  hostname
});

console.log(`Worldloom Studio server listening on http://${hostname}:${port}`);

export { createApp } from "./app.js";
export { WorldFile } from "./world-file.js";
