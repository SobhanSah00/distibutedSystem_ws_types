import WebSocket from "ws";
import { setBridge } from "./server1";

export function startBridge() {
  const bridge = new WebSocket("ws://localhost:8081");

  bridge.on("open", () => {
    console.log("🔌 Bridge connected to Server2");
    setBridge(bridge);
  });

  bridge.on("error", (err) => {
    console.error("❌ Bridge error:", err);
  });

  bridge.on("close", () => {
    console.warn("⚠️ Bridge connection closed");
  });
}
