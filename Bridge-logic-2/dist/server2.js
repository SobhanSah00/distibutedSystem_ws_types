"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server2Clients = void 0;
const ws_1 = __importDefault(require("ws"));
// 👇 Export clients so reverseBridge can access them
exports.server2Clients = new Set();
const wss = new ws_1.default.Server({ port: 8081 });
console.log("✅ Server2 running on ws://localhost:8081");
wss.on("connection", (socket) => {
    console.log("🔗 Client/Bridge connected to Server2");
    exports.server2Clients.add(socket); // 👈 Add to set
    socket.send("Welcome to Server2 (8081)!");
    socket.on("message", (message) => {
        console.log("📨 Server2 received:", message.toString());
        // You can optionally echo back
        // socket.send("Echo from Server2: " + message.toString());
    });
    socket.on("close", () => {
        exports.server2Clients.delete(socket); // 👈 Remove on disconnect
        console.log("❌ Connection closed from Server2 side");
    });
});
