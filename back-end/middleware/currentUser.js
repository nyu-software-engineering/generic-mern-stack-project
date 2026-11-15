// Sprint 2 placeholder. Account routes will replace this identity in #92.
export function currentUser(request, _response, next) {
  request.currentUserId = "owner-1";
  next();
}
