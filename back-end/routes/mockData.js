import { Router } from "express";

export const mockDataRouter = Router();

mockDataRouter.get("/mock-data", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();
  response.json(data);
});
