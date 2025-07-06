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



/*

Very Important thing to know here 

    There are two parallel mechanisms in the server:
        1. WebSocket server (wss.on("connection"))
        Accepts connections from real clients (like a browser or wscat)

        When a message comes from a client:

        It's published to Redis using pub.publish(...)

        2. Redis subscriber (sub.subscribe(...))
        Runs independently at the top

        Listens for new messages from Redis

        When Redis sends a message:

        The server broadcasts it to all connected WebSocket clients

*/