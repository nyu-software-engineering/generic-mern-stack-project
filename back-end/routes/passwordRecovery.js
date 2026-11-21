import { Router } from "express";
import { RecoveryError } from "../services/recovery.js";

export function createRecoveryRouter(recovery) {
  const router = Router();

  function reply(action, status) {
    return async (request, response, next) => {
      try {
        const { email, token, password } = request.body ?? {};
        const result = await action({ email, token, password, ip: request.socket.remoteAddress });
        response.status(status).json(result);
      } catch (error) {
        if (!(error instanceof RecoveryError)) return next(error);
        if (error.retryAfter) response.set("Retry-After", String(error.retryAfter));
        response.status(error.status).json({ error: error.message });
      }
    };
  }

  router.post("/forgot-password", reply(recovery.requestReset, 202));
  router.post("/reset-password", reply(recovery.resetPassword, 200));
  return router;
}
