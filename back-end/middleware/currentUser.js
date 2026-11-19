
export function currentUser(request, _response, next) {
  const token = /^Bearer ([a-f0-9]{64})$/.exec(request.get?.("authorization") ?? "")?.[1];

  request.authenticatedUserId = token
    ? request.app?.locals?.auth?.sessions?.get(token)
    : undefined;

  request.currentUserId = request.authenticatedUserId ?? "owner-1";
  next();
}
