import WebSocket from "ws";
import { server1Clients } from "./server1";

interface BridgeMessage {
  type: "bridge-message" | "bridge-init" | "heartbeat" | "heartbeat-ack";
  content?: string;
  timestamp?: number;
}

let bridge: WebSocket | null = null;
let isConnected = false;
let retryCount = 0;
const maxRetries = 10;
const retryDelay = 5000;
const heartbeatIntervalInMs = 30000;
let heartbeatInterval: NodeJS.Timeout | null = null;
let heartbeatTimeout: NodeJS.Timeout | null = null;

export function createBridge() {
  console.log("🔌 Attempting to connect bridge to ws://localhost:8081");
  bridge = new WebSocket("ws://localhost:8081");

  bridge.on("open", () => {
    console.log("✅ Bridge connected to server2");
    isConnected = true;
    retryCount = 0;

    bridge?.send(
      JSON.stringify({
        type: "bridge-init",
      } satisfies BridgeMessage)
    );

    startHeartbeat();

    for (const client of server1Clients) {
      client.on("message", (msg) => {
        if (isConnected && bridge?.readyState === WebSocket.OPEN) {
          const message: BridgeMessage = {
            type: "bridge-message",
            content: msg.toString(),
            timestamp: Date.now(),
          };
          bridge.send(JSON.stringify(message));
        }
      });
    }
  });

  bridge.on("message", (data) => {
    try {
      const msg: BridgeMessage = JSON.parse(data.toString());

      if (msg.type === "bridge-message" && msg.content) {
        for (const client of server1Clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`from server2: ${msg.content}`);
          }
        }
      }

      if (msg.type === "heartbeat-ack" && heartbeatTimeout) {
        clearTimeout(heartbeatTimeout);
        heartbeatTimeout = null;
      }
    } catch {
      console.error("❌ Invalid message from bridge:", data.toString());
    }
  });

  bridge.on("close", () => {
    console.warn("🔌 Bridge connection closed");
    cleanupBridge();
    reconnectBridge();
  });

  bridge.on("error", (err) => {
    console.error("⚠️ Bridge error:", err);
    cleanupBridge();
    reconnectBridge();
  });
}

function cleanupBridge() {
  isConnected = false;
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
  heartbeatInterval = null;
  heartbeatTimeout = null;
  bridge = null;
}

function reconnectBridge() {
  if (retryCount >= maxRetries) {
    console.error("❌ Max retries reached. Retrying in 15 seconds.");
    retryCount = 0;
    setTimeout(createBridge, 15000);
    return;
  }

  retryCount++;
  console.log(`🔁 Retry ${retryCount}/${maxRetries} in ${retryDelay}ms`);
  setTimeout(() => {
    if (!isConnected) createBridge();
  }, retryDelay);
}

function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    if (!isConnected || !bridge || bridge.readyState !== WebSocket.OPEN) {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      return;
    }

    bridge.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));

    heartbeatTimeout = setTimeout(() => {
      console.warn("💔 Heartbeat timeout. Terminating bridge.");
      bridge?.terminate();
      isConnected = false;
      reconnectBridge();
    }, 5000);
  }, heartbeatIntervalInMs);
}
