import { once } from "node:events";

export async function startTestServer(app) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    async close() {
      if (!server.listening) return;
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
