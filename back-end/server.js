import { fileURLToPath } from "node:url";
import { loadEnvironment, recoveryConfiguration } from "./config.js";

loadEnvironment({ directory: fileURLToPath(new URL(".", import.meta.url)) });
const { createApp } = await import("./app.js");
const app = createApp({ recovery: recoveryConfiguration(process.env) });
const port = Number(process.env.PORT ?? 3001);

app.listen(port, "127.0.0.1", () => {
  console.log(`DormShare backend listening at http://127.0.0.1:${port}`);
});
