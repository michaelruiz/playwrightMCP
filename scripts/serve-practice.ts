import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const rootDir = process.cwd();

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function resolveRequestPath(rawUrl: string | undefined): string | null {
  const url = new URL(rawUrl || "/", `http://${host}:${port}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    pathname = "/practice/";
  }

  if (pathname.endsWith("/")) {
    pathname += "index.html";
  }

  const filePath = path.resolve(rootDir, `.${pathname}`);
  const relativePath = path.relative(rootDir, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

function sendTextResponse(
  response: ServerResponse<IncomingMessage>,
  statusCode: number,
  body: string,
): void {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(body);
}

const server = createServer((request, response) => {
  const method = request.method || "GET";

  if (!["GET", "HEAD"].includes(method)) {
    sendTextResponse(response, 405, "Method Not Allowed");
    return;
  }

  if (request.url === "/favicon.ico") {
    response.writeHead(204);
    response.end();
    return;
  }

  const filePath = resolveRequestPath(request.url);
  if (!filePath || !existsSync(filePath)) {
    sendTextResponse(response, 404, "File not found");
    return;
  }

  const stats = statSync(filePath);
  if (!stats.isFile()) {
    sendTextResponse(response, 404, "File not found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[extension] || "application/octet-stream";

  response.writeHead(200, {
    "Content-Length": stats.size,
    "Content-Type": contentType,
  });

  if (method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Practice server running at http://${host}:${port}/practice/`);
});
