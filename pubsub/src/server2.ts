import WebSocket, { WebSocketServer } from "ws";
import { pub, sub } from "./pubsub";

const server2Clients = new Set<WebSocket>();
const wss = new WebSocketServer({ port: 8081 });
console.log("✅ Server2 running on ws://localhost:8081");

(async () => {
    await sub.subscribe("chat", (msg) => {
        for (const client of server2Clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`[Redis] ${msg}`);
            }
        }
    });
})()

wss.on("connection", (socket) => {
    server2Clients.add(socket);
    console.log("🔗 Client connected to Server2");
    socket.send("Welcome to Server2 (8081)");

    socket.on("message", (msg) => {
        console.log("📨 Server2 received:", msg.toString());

        pub.publish("chat", `From Server2: ${msg.toString()}`);
    });

    socket.on("close", () => {
        server2Clients.delete(socket);
        console.log("❌ Disconnected from Server2");
    });
});
