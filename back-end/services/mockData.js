import { validateMockData } from "../../shared/validateMockData.mjs";

export function createMockDataStore({ fetchImpl = globalThis.fetch, apiKey } = {}) {
  let loading;

  return {
    load() {
      if (loading) return loading;

      const key = (apiKey ?? process.env.MOCKAROO_API_KEY ?? "").trim();
      if (!key) {
        return Promise.reject(Object.assign(new Error("Mock data is not configured."), { status: 503 }));
      }

      loading = Promise.resolve()
        .then(() => fetchImpl("https://my.api.mockaroo.com/dormshare.json", {
          headers: { "X-API-Key": key },
          signal: AbortSignal.timeout(15000),
        }))
        .then(async (response) => {
          if (!response.ok) throw new Error("Mockaroo request failed.");
          const data = await response.json();
          validateMockData(data);
          return { ...data, quickBorrowRequests: data.quickBorrowRequests ?? [] };
        })
        .catch(() => {
          loading = undefined;
          throw Object.assign(new Error("Could not load mock data."), { status: 502 });
        });

      return loading;
    },
  };
}
