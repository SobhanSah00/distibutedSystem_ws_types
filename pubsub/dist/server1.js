"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const pubsub_1 = require("./pubsub");
const server1Clients = new Set();
const wss = new ws_1.default.Server({ port: 8080 });
console.log("✅ Server1 running on ws://localhost:8080");
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield pubsub_1.sub.subscribe("chat", (msg) => {
        for (const client of server1Clients) {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(`[Redis] ${msg}`);
            }
        }
    });
}))();
wss.on("connection", (socket) => {
    server1Clients.add(socket);
    console.log("🔗 Client connected to Server1");
    socket.send("Welcome to Server1 (8080)");
    socket.on("message", (msg) => {
        console.log("📨 Server1 received:", msg.toString());
        pubsub_1.pub.publish("chat", `From Server1: ${msg.toString()}`);
    });
    socket.on("close", () => {
        server1Clients.delete(socket);
        console.log("❌ Disconnected from Server1");
    });
});
