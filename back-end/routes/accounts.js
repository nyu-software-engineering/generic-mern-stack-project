
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { Router } from "express";

export const accountRouter = Router();

const emailOf = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const profile = ({ id, email, displayName, campusArea, emailVerified }) =>
  ({ id, email, displayName, campusArea, emailVerified });
const fail = (res, status, error) => res.status(status).json({ error });

function session(request, user) {
  const token = randomBytes(32).toString("hex");
  request.app.locals.auth.sessions.set(token, user.id);
  return { user: profile(user), token };
}

async function requireAccount(request, response, next) {
  if (!request.authenticatedUserId) return fail(response, 401, "Sign in required.");

  const { users } = await request.app.locals.mockDataStore.load();
  request.accountUser = users.find((user) => user.id === request.authenticatedUserId);

  if (!request.accountUser) return fail(response, 401, "Account not found.");
  next();
}

// Create an NYU account. Verification is simulated for the Sprint 2 demo.
accountRouter.post("/auth/signup", async (request, response) => {
  const { fullName, password } = request.body ?? {};
  const name = typeof fullName === "string" ? fullName.trim() : "";
  const email = emailOf(request.body?.email);

  if (!name || name.length > 80 || !/^[^\s@]+@nyu\.edu$/.test(email) ||
      typeof password !== "string" || password.length < 8 || password.length > 128) {
    return fail(response, 400, "Enter a valid name, NYU email, and password (8-128 characters).");
  }

  const { users } = await request.app.locals.mockDataStore.load();
  const { credentials } = request.app.locals.auth;

  if (users.some((user) => emailOf(user.email) === email)) {
    return fail(response, 409, "An account with this email already exists.");
  }

  const user = {
    id: `account-${randomBytes(8).toString("hex")}`,
    name, displayName: name, email, campusArea: "", emailVerified: false,
  };
  const salt = randomBytes(16).toString("hex");
  const demoCode = String(randomInt(100000, 1000000));

  credentials.set(email, { salt, hash: scryptSync(password, salt, 32), code: demoCode });
  users.push(user);

  response.status(201).json({ user: profile(user), demoCode });
});

// Verify the six-digit demo code.
accountRouter.post("/auth/verify", async (request, response) => {
  const email = emailOf(request.body?.email);
  const { users } = await request.app.locals.mockDataStore.load();
  const account = request.app.locals.auth.credentials.get(email);
  const user = users.find((item) => emailOf(item.email) === email);

  if (!account || !user || typeof request.body?.code !== "string" ||
      !/^\d{6}$/.test(request.body.code) || request.body.code !== account.code) {
    return fail(response, 400, "Invalid verification code.");
  }

  user.emailVerified = true;
  delete account.code;
  response.json({ user: profile(user) });
});


// Sign in using the registered email and password.
accountRouter.post("/auth/login", async (request, response) => {
  const email = emailOf(request.body?.email);
  const password = request.body?.password;
  const { credentials } = request.app.locals.auth;
  const account = credentials.get(email);

  if (!account || typeof password !== "string" || password.length > 128 ||
      !timingSafeEqual(scryptSync(password, account.salt, 32), account.hash)) {
    return fail(response, 401, "Invalid email or password.");
  }

  const { users } = await request.app.locals.mockDataStore.load();
  const user = users.find((item) => item.email === email);

  if (!user || credentials.get(email) !== account) return fail(response, 401, "Invalid email or password.");
  if (!user.emailVerified) return fail(response, 403, "Verify your email first.");

  response.json(session(request, user));
});

// Read and update the signed-in user's profile.
accountRouter.get("/users/me", requireAccount, (request, response) => {
  response.json({ user: profile(request.accountUser) });
});

accountRouter.put("/users/me", requireAccount, (request, response) => {
  const { displayName, campusArea } = request.body ?? {};

  if (![displayName, campusArea].every(
    (value) => typeof value === "string" && value.trim() && value.trim().length <= 80
  )) {
    return fail(response, 400, "Display name and campus area are required (max 80 characters).");
  }

  Object.assign(request.accountUser, {
    name: displayName.trim(),
    displayName: displayName.trim(),
    campusArea: campusArea.trim(),
  });

  response.json({ user: profile(request.accountUser) });
});
