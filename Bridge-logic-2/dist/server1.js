"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bridgeSocket = exports.server1Clients = void 0;
exports.setBridge = setBridge;
const ws_1 = __importDefault(require("ws"));
exports.server1Clients = new Set();
exports.bridgeSocket = null;
function setBridge(socket) {
    exports.bridgeSocket = socket;
}
const wss = new ws_1.default.Server({ port: 8080 });
console.log("✅ Server1 running on ws://localhost:8080");
wss.on("connection", (socket) => {
    console.log("🔗 Client connected to Server1");
    exports.server1Clients.add(socket);
    socket.send("Welcome to Server1 (8080)!");
    socket.on("message", (message) => {
        console.log("📨 Server1 received:", message.toString());
        socket.send("Echo from Server1: " + message.toString());
        // Forward to bridge if connected
        if (exports.bridgeSocket && exports.bridgeSocket.readyState === ws_1.default.OPEN) {
            exports.bridgeSocket.send(message.toString());
        }
    });
    socket.on("close", () => {
        exports.server1Clients.delete(socket);
        console.log("❌ Client disconnected from Server1");
    });
});
