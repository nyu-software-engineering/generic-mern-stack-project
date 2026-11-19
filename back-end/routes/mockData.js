import { Router } from "express";

export const mockDataRouter = Router();

mockDataRouter.get("/mock-data", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();

  response.json({
    ...data,
    users: data.users.map((user) => user.id.startsWith("account-")
      ? { id: user.id, name: "DormShare student" }
      : user),
  });
});
