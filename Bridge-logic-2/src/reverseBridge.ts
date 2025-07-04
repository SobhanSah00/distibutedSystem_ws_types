import WebSocket from "ws";
import { server2Clients } from "./server2"; // We'll export this

let reverseBridge: WebSocket | null = null;

export function startReverseBridge() {
  console.log("🔁 Connecting reverse bridge to Server1...");
  reverseBridge = new WebSocket("ws://localhost:8080");

  reverseBridge.on("open", () => {
    console.log("✅ Reverse bridge connected to Server1");

    for (const client of server2Clients) {
      client.on("message", (msg) => {
        if (reverseBridge && reverseBridge.readyState === WebSocket.OPEN) {
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
