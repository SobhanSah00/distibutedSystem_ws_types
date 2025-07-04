import WebSocket from "ws";
import { pub, sub } from "./pubsub";

const server1Clients = new Set<WebSocket>();

const wss = new WebSocket.Server({ port: 8080 });
console.log("✅ Server1 running on ws://localhost:8080");

(async () => {
  await sub.subscribe("chat", (msg) => {
    for (const client of server1Clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`[Redis] ${msg}`);
      }
    }
  });
})();

wss.on("connection", (socket) => {
  server1Clients.add(socket);
  console.log("🔗 Client connected to Server1");

  socket.send("Welcome to Server1 (8080)");

  socket.on("message", (msg) => {
    console.log("📨 Server1 received:", msg.toString());
    pub.publish("chat", `From Server1: ${msg.toString()}`);
  });

  socket.on("close", () => {
    server1Clients.delete(socket);
    console.log("❌ Disconnected from Server1");
  });
});
