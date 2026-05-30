const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");
const port = Number(process.env.PORT || 5000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function normalizeUrl(rawUrl) {
  try {
    return new URL(rawUrl, "http://localhost");
  } catch (error) {
    return new URL("/", "http://localhost");
  }
}

function getPrefix(pathname) {
  const first = pathname.split("/").filter(Boolean)[0] || "";
  return /^(stag|prod)--/.test(first) ? `/${first}/` : "/";
}

function stripPrefix(pathname, prefix) {
  if (prefix === "/") return pathname;
  if (pathname === prefix.slice(0, -1)) return "/";
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length - 1) : pathname;
}

function safeJoin(relativePath) {
  const resolved = path.resolve(root, relativePath.replace(/^\/+/, ""));
  return resolved.startsWith(root) ? resolved : root;
}

function send(res, statusCode, body, contentType) {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": contentType.startsWith("text/html") ? "no-store" : "public, max-age=3600",
  });
  res.end(body);
}

function runtimeConfig(basePath) {
  return {
    basePath,
    backendApiPrefix: process.env.BK_BACKEND_API_PREFIX || "",
    bkvisionDashboardUrl: process.env.BKVISION_DASHBOARD_URL || "",
  };
}

function replaceAllTokens(value, token, replacement) {
  return value.split(token).join(replacement);
}

function sendHtml(res, filePath, basePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const configScript = `<script>window.__APP_CONFIG__ = ${JSON.stringify(runtimeConfig(basePath))};</script>`;
  html = replaceAllTokens(html, "%APP_BASE%", basePath);
  html = replaceAllTokens(html, "%APP_CONFIG_SCRIPT%", configScript);
  send(res, 200, html, mimeTypes[".html"]);
}

function sendFile(res, filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    send(res, 404, "Not found", mimeTypes[".txt"]);
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  send(res, 200, fs.readFileSync(filePath), mimeTypes[ext] || "application/octet-stream");
}

function routePage(pathname) {
  if (pathname === "/" || pathname === "/analytics/") return "index.html";
  if (pathname === "/hosts/" || pathname === "/hosts") return "hosts/index.html";
  if (pathname === "/jobs/" || pathname === "/jobs") return "jobs/index.html";
  return "";
}

const server = http.createServer((req, res) => {
  const url = normalizeUrl(req.url || "/");
  const basePath = getPrefix(url.pathname);
  const pathname = stripPrefix(url.pathname, basePath);
  const page = routePage(pathname);

  if (page) {
    sendHtml(res, safeJoin(page), basePath);
    return;
  }

  if (pathname.startsWith("/assets/")) {
    sendFile(res, safeJoin(pathname));
    return;
  }

  send(res, 404, "Not found", mimeTypes[".txt"]);
});

server.listen(port, "::", () => {
  console.log(`bk-lab-final-frontend listening on ${port}`);
});
