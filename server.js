import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";

const PORT = 8000;
const __dirname = import.meta.dirname;

const server = http.createServer(async (req, res) => {
  if (req.url === "/api") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Investment successful!" }));
    return;
  }

  if (req.url === "/") {
    const filePath = path.join(__dirname, "public", "index.html");
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(content);
    return;
  }

  const filePath = path.join(__dirname, "public", req.url);

  try {
    const content = await fs.readFile(filePath);

    const ext = path.extname(filePath);

    const contentTypes = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".html": "text/html",
    };

    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
    });

    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () =>
  console.log(`Server is listening at http://localhost:${PORT}`),
);
