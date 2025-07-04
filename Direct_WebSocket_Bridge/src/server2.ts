import { WebSocketServer, WebSocket } from "ws";

export const server2Clients = new Set<WebSocket>();
export const server2 = new WebSocketServer({ port: 8081 });

console.log("✅ Server2 running on ws://localhost:8081");

server2.on("connection", (socket) => {
  server2Clients.add(socket);
  socket.send("Connected to Server2 (8081)");

  socket.on("message", (msg) => {
    console.log(`📨 Server2 received: ${msg}`);
    socket.send(`Echo from 8081: ${msg}`);
  });

  socket.on("close", () => {
    server2Clients.delete(socket);
  });
});
