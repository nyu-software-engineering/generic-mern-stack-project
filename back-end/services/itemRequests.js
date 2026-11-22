// Item request lookups shared by routes (#114). The requests board uses this now, and the
// item requests routes should use it too so both always agree on what "open" means.

// Open item requests, newest first.
export const getOpenItemRequests = (data) =>
  data.itemRequests
    .filter((request) => request.status === "open")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
