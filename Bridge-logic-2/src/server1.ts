import WebSocket from "ws";

export const server1Clients = new Set<WebSocket>();
export let bridgeSocket: WebSocket | null = null;

export function setBridge(socket: WebSocket) {
  bridgeSocket = socket;
}

const wss = new WebSocket.Server({ port: 8080 });
console.log("✅ Server1 running on ws://localhost:8080");

wss.on("connection", (socket) => {
  console.log("🔗 Client connected to Server1");
  server1Clients.add(socket);
  socket.send("Welcome to Server1 (8080)!");

  socket.on("message", (message) => {
    console.log("📨 Server1 received:", message.toString());
    socket.send("Echo from Server1: " + message.toString());

    // Forward to bridge if connected
    if (bridgeSocket && bridgeSocket.readyState === WebSocket.OPEN) {
      bridgeSocket.send(message.toString());
    }
  });

  socket.on("close", () => {
    server1Clients.delete(socket);
    console.log("❌ Client disconnected from Server1");
  });
});
