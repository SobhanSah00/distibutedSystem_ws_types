import WebSocket from "ws";

// 👇 Export clients so reverseBridge can access them
export const server2Clients = new Set<WebSocket>();

const wss = new WebSocket.Server({ port: 8081 });
console.log("✅ Server2 running on ws://localhost:8081");

wss.on("connection", (socket) => {
  console.log("🔗 Client/Bridge connected to Server2");

  server2Clients.add(socket); // 👈 Add to set

  socket.send("Welcome to Server2 (8081)!");

  socket.on("message", (message) => {
    console.log("📨 Server2 received:", message.toString());

    // You can optionally echo back
    // socket.send("Echo from Server2: " + message.toString());
  });

  socket.on("close", () => {
    server2Clients.delete(socket); // 👈 Remove on disconnect
    console.log("❌ Connection closed from Server2 side");
  });
});
