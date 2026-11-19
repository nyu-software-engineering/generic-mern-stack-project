export function currentUser(request, response, next) {
  const authorization = request.get?.("authorization");
  const token = /^Bearer ([a-f0-9]{64})$/.exec(authorization ?? "")?.[1];
  const userId = token
    ? request.app?.locals?.auth?.sessions?.get(token)
    : undefined;

  if (authorization !== undefined && !userId) {
    return response.status(401).json({ error: "Invalid or expired session." });
  }

  request.authenticatedUserId = userId;
  request.currentUserId = userId ?? "owner-1";
  next();
}
