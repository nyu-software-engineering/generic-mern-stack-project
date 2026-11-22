import { resolve } from "node:path";
import dotenv from "dotenv";
import { createBrevoDelivery } from "./services/recoveryDelivery.js";

export function loadEnvironment({ directory, env = process.env }) {
  dotenv.config({
    path: [resolve(directory, ".env.local"), resolve(directory, ".env")],
    processEnv: env,
    override: false,
    quiet: true,
    debug: false,
  });
}

export function recoveryConfiguration(env) {
  try {
    const deliver = createBrevoDelivery({
      apiKey: env.BREVO_API_KEY,
      from: env.RECOVERY_FROM,
      fromName: env.RECOVERY_FROM_NAME,
    });
    return { deliver };
  } catch {
    return undefined;
  }
}
