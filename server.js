import http from "node:http";
import path from "node:path";
import fs from "node:fs/promises";
import { EventEmitter } from "node:events";

const PORT = 8000;
const __dirname = import.meta.dirname;

const emitter = new EventEmitter();

let goldPrice = 1900;

function generatePrice() {
  const change = (Math.random() - 0.5) * 8;
  goldPrice += change;

  if (goldPrice < 1800) goldPrice = 1800;
  if (goldPrice > 2100) goldPrice = 2100;

  goldPrice = Number(goldPrice.toFixed(2));

  emitter.emit("priceUpdate", goldPrice);
}

setInterval(generatePrice, 3000);

const server = http.createServer(async (req, res) => {
  if (req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const sendPrice = (price) => {
      res.write(`data: ${JSON.stringify({ price })}\n\n`);
    };

    sendPrice(goldPrice);

    emitter.on("priceUpdate", sendPrice);

    req.on("close", () => {
      emitter.off("priceUpdate", sendPrice);
    });

    return;
  }

  if (req.url === "/api/buy" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      const { amount } = JSON.parse(body);

      const ounces = (amount / goldPrice).toFixed(4);

      const logEntry = `User invested £${amount} | Price: £${goldPrice} | Ounces: ${ounces} | ${new Date().toISOString()}\n`;

      await fs.appendFile("purchases.txt", logEntry);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, ounces }));
    });

    return;
  }

  if (req.url === "/") {
    const file = await fs.readFile(
      path.join(__dirname, "public", "index.html"),
    );
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(file);
    return;
  }

  try {
    const filePath = path.join(__dirname, "public", req.url);
    const file = await fs.readFile(filePath);

    const ext = path.extname(filePath);

    const contentTypes = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
    };

    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
    });

    res.end(file);
  } catch {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
