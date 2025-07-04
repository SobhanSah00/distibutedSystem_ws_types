"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server1 = exports.server1Clients = void 0;
const ws_1 = require("ws");
exports.server1Clients = new Set();
exports.server1 = new ws_1.WebSocketServer({ port: 8080 });
console.log("✅ Server1 running on ws://localhost:8080");
exports.server1.on('connection', (socket) => {
    exports.server1Clients.add(socket);
    socket.send('connection to server1 : 8080');
    socket.on('message', (msg) => {
        console.log(`📨 Server1 received: ${msg.toString()}`);
        socket.send(`Echo from 8080 : ${msg.toString()}`);
    });
    socket.on('close', () => {
        exports.server1Clients.delete(socket);
    });
});
