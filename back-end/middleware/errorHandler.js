export function errorHandler(error, _request, response, next) {
  if (response.headersSent) return next(error);

  let status = 500;
  let message = "An unexpected error occurred.";

  if (error.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON.";
  } else if (error.type === "entity.too.large") {
    status = 413;
    message = "Request body too large.";
  } else if (error.status === 502) {
    status = 502;
    message = "Could not load mock data.";
  } else if (error.status === 503) {
    status = 503;
    message = "Mock data is not configured.";
  }

  response.status(status).json({ error: message });
}
