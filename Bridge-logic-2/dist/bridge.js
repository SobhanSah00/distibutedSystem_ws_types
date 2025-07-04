"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBridge = startBridge;
const ws_1 = __importDefault(require("ws"));
const server1_1 = require("./server1");
function startBridge() {
    const bridge = new ws_1.default("ws://localhost:8081");
    bridge.on("open", () => {
        console.log("🔌 Bridge connected to Server2");
        (0, server1_1.setBridge)(bridge);
    });
    bridge.on("error", (err) => {
        console.error("❌ Bridge error:", err);
    });
    bridge.on("close", () => {
        console.warn("⚠️ Bridge connection closed");
    });
}
