
import WebSocket from "ws";

const server2Clients = new Set<WebSocket>();
const wss = new WebSocket.Server({ port: 8081 });
console.log("✅ Server2 running on ws://localhost:8081");

wss.on("connection", (socket) => {
  console.log("🧑‍💻 New client connected to server2");

  let isBridge = false;

  server2Clients.add(socket);

  socket.on("message", (data) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.type === "bridge-init") {
        console.log("🤝 Server2 received bridge connection");
        isBridge = true;
        return;
      }

      if (parsed.type === "heartbeat") {
        socket.send(JSON.stringify({ type: "heartbeat-ack" }));
        return;
      }

      if (parsed.type === "bridge-message" && parsed.content) {
        console.log("📨 Server2 received:", parsed.content);

        // Broadcast to all non-bridge clients
        for (const client of server2Clients) {
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(parsed.content);
          }
        }

        // Optional: Echo back to bridge as-is
        if (isBridge) {
          socket.send(JSON.stringify(parsed));
        }
      }
    } catch {
      if (!isBridge) {
        socket.send(`Echo from 8081: ${data.toString()}`);
      }
    }
  });

  socket.on("close", () => {
    server2Clients.delete(socket);
    console.log("❌ Client disconnected from server2");
  });
});
