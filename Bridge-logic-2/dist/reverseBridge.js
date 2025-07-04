"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReverseBridge = startReverseBridge;
const ws_1 = __importDefault(require("ws"));
const server2_1 = require("./server2"); // We'll export this
let reverseBridge = null;
function startReverseBridge() {
    console.log("🔁 Connecting reverse bridge to Server1...");
    reverseBridge = new ws_1.default("ws://localhost:8080");
    reverseBridge.on("open", () => {
        console.log("✅ Reverse bridge connected to Server1");
        for (const client of server2_1.server2Clients) {
            client.on("message", (msg) => {
                if (reverseBridge && reverseBridge.readyState === ws_1.default.OPEN) {
                    reverseBridge.send(msg.toString());
                }
            });
        }
    });
    reverseBridge.on("error", (err) => {
        console.error("❌ Reverse bridge error:", err);
    });
    reverseBridge.on("close", () => {
        console.warn("⚠️ Reverse bridge connection closed");
    });
}
