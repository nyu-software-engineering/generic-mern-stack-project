import { readFileSync } from "node:fs";

const profile = JSON.parse(
  readFileSync(new URL("./profile.json", import.meta.url), "utf8"),
);
const applications = JSON.parse(
  readFileSync(new URL("./applications.json", import.meta.url), "utf8"),
);
const discussions = JSON.parse(
  readFileSync(new URL("./discussions.json", import.meta.url), "utf8"),
);
const matches = JSON.parse(
  readFileSync(new URL("./matches.json", import.meta.url), "utf8"),
);
const accounts = JSON.parse(
  readFileSync(new URL("./accounts.json", import.meta.url), "utf8"),
);

function send(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function appMiddleware(request, response, next) {
  const path = new URL(request.url, "http://localhost").pathname;
  const known = [
    "/api/profile",
    "/api/applications",
    "/api/discussions",
    "/api/matches",
  ];
  if (!known.some((item) => path === item || path.startsWith(item + "/")))
    return next();
  if (request.method === "POST" && path.startsWith("/api/matches/")) {
    return readJson(request).then((body) => {
      const saved = body?.profile;
      if (!saved || saved.id !== profile.id || !Number.isInteger(saved.revision) || saved.revision < 1
        || ![saved.major, saved.graduationDate, saved.workAuthorization].every((value) => typeof value === "string" && value.trim())
        || !Array.isArray(saved.skills) || !saved.skills.length
        || !saved.skills.every((skill) => typeof skill === "string" && skill.trim())) {
        return send(response, 400, { error: "A complete saved demo profile is required" });
      }
      let jobId;
      try { jobId = decodeURIComponent(path.slice("/api/matches/".length)); }
      catch { return send(response, 400, { error: "Invalid job identifier" }); }
      const match = matches.find((item) => item.jobId === jobId);
      if (!match) return send(response, 404, { error: "Match not found" });
      const skills = new Set(saved.skills.map((skill) => skill.trim().toLowerCase()));
      // Fixture weights make profile edits observable; they are not a live AI score.
      const criteria = Object.entries(match.skillWeights);
      const present = criteria.filter(([skill]) => skills.has(skill.toLowerCase()));
      return send(response, 200, {
        jobId,
        profileId: saved.id,
        profileRevision: saved.revision,
        score: present.reduce((total, [, weight]) => total + weight, 0),
        summary: present.length
          ? "Mock match based on your saved skills: " + present.map(([skill]) => skill).join(", ") + "."
          : "None of this role's listed skills are in your saved profile yet.",
        fitExplanation: present.map(([skill]) => "Your saved profile includes " + skill + "."),
        missingSkills: criteria.filter(([skill]) => !skills.has(skill.toLowerCase())).map(([skill]) => skill),
        keyQualifications: match.keyQualifications,
      });
    });
  }
  if (request.method !== "GET")
    return send(response, 405, { error: "Method not allowed" });

  if (path === "/api/profile") return send(response, 200, profile);
  if (path === "/api/applications") return send(response, 200, applications);
  if (path.startsWith("/api/applications/")) {
    const id = decodeURIComponent(path.slice("/api/applications/".length));
    const application = applications.find((item) => item.id === id);
    return send(
      response,
      application ? 200 : 404,
      application ?? { error: "Application not found" },
    );
  }
  if (path === "/api/discussions") return send(response, 200, discussions);
  if (path.startsWith("/api/discussions/")) {
    const jobId = decodeURIComponent(path.slice("/api/discussions/".length));
    return send(
      response,
      200,
      discussions.filter((item) => item.jobId === jobId),
    );
  }
  if (path.startsWith("/api/matches/")) {
    const jobId = decodeURIComponent(path.slice("/api/matches/".length));
    const match = matches.find((item) => item.jobId === jobId);
    return send(
      response,
      match ? 200 : 404,
      match ?? { error: "Match not found" },
    );
  }
  return send(response, 404, { error: "Not found" });
}

function readJson(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function authMiddleware(request, response, next) {
  const path = new URL(request.url, "http://localhost").pathname;
  if (
    request.method !== "POST" ||
    (path !== "/api/login" && path !== "/api/signup")
  )
    return next();

  readJson(request).then(({ email, password }) => {
    const account = accounts.find((item) => item.email === email);
    if (path === "/api/login") {
      if (account && account.password === password)
        return send(response, 200, { ok: true });
      return send(response, 401, {
        error: "Incorrect email or password. Please try again.",
      });
    }
    if (account) {
      return send(response, 409, {
        error:
          "Email in use or passwords don't match. Sign in or use matching passwords.",
      });
    }
    accounts.push({ email, password });
    return send(response, 201, { ok: true });
  });
}
export default function appMockApi() {
  return {
    name: 'careerhive-app-mock-api',
    configureServer(server) {
      server.middlewares.use(authMiddleware)
      server.middlewares.use(appMiddleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(authMiddleware)
      server.middlewares.use(appMiddleware)
    },
  }
}