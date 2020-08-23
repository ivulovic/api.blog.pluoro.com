module.exports = {
  Ok: { status: 200, message: "" },
  NotFound: { status: 404, message: "Not Found" },
  Unauthorized: { status: 403, message: "Unauthorized" },
  TooManyConnections: { status: 429, message: "Too Many Requests. Your IP has been blocked." },
}