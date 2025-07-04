"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server2 = exports.server2Clients = void 0;
const ws_1 = require("ws");
exports.server2Clients = new Set();
exports.server2 = new ws_1.WebSocketServer({ port: 8081 });
console.log("✅ Server2 running on ws://localhost:8081");
exports.server2.on("connection", (socket) => {
    exports.server2Clients.add(socket);
    socket.send("Connected to Server2 (8081)");
    socket.on("message", (msg) => {
        console.log(`📨 Server2 received: ${msg}`);
        socket.send(`Echo from 8081: ${msg}`);
    });
    socket.on("close", () => {
        exports.server2Clients.delete(socket);
    });
});
