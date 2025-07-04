import WebSocket from "ws";
import { server1Clients } from "./server1";

interface BridgeMessage {
    type: "bridge-message" | "bridge-init" | "heartBeat" | "heartBeat-ack"
    content?: String
    timeStamp?: number
}

let bridge: WebSocket | null = null
let isConnected = false // the bridge is connected or not 
let retryCount = 0 // how many times retry happen
const maxRetries = 10 // maximum retries , after that we have to long time back off
const retryDelay = 5000 //wait time between the retries
const heartBeatInterValInMS = 30000 //how ofter to send the heartbeat
let heartBeatInterval: NodeJS.Timeout | null = null // interval time to send headbeats.
let heartBeatTimeout: NodeJS.Timeout | null = null // timeour waiting for a heartbeat-ack

export function createBridge() {
    console.log("🔌 Attempting to connect bridge to ws://localhost:8081");
    bridge = new WebSocket('ws://localhost:8001')

    bridge.on('open', () => {
        console.log("✅ Bridge connected to server2");
        isConnected = true;
        retryCount = 0;

        // send handsake
        bridge?.send(
            JSON.stringify({
                type: 'bridge-init'
            } satisfies BridgeMessage)
        )

        startHeartbeat();

        for (const clients of server1Clients) {
            clients.on("message", (msg) => {
                if (isConnected && bridge?.readyState == WebSocket.OPEN) {
                    const message: BridgeMessage = {
                        type: "bridge-message",
                        content: msg.toString(),
                        timeStamp: Date.now()
                    }
                    bridge.send(JSON.stringify(message))
                }
            })
        }
    })

    bridge.on("message", (data) => {
        try {
            const msg: BridgeMessage = JSON.parse(data.toString())

            if (msg.type == 'bridge-message' && msg.content) {
                for (const client of server1Clients) {
                    if (client.readyState == WebSocket.OPEN) {
                        client.send(`from server2 : ${msg.content}`)
                    }
                }
            }

            if (msg.type == 'heartBeat-ack') {
                if (heartBeatTimeout) {
                    clearTimeout(heartBeatTimeout)
                    heartBeatTimeout = null
                }
            }
        }
        catch (err) {
            console.error("❌ Invalid message from bridge:", data.toString())
        }
    })

    bridge.on('close', () => {
        console.warn("🔌 Bridge connection closed");
        cleanupBridge();
        reconnectBridge();
    })

    bridge.on("error", (err) => {
        console.error("⚠️ Bridge error:", err);
        cleanupBridge();
        reconnectBridge();
    })

}

function cleanupBridge() {
  isConnected = false;
  if (heartBeatInterval) {
    clearInterval(heartBeatInterval);
    heartBeatInterval = null;
  }
  if (heartBeatTimeout) {
    clearTimeout(heartBeatTimeout);
    heartBeatTimeout = null;
  }
  bridge = null;
}

function reconnectBridge() {
  if (retryCount >= maxRetries) {
    console.error("❌ Max retries reached. Will retry in 15 seconds.");
    retryCount = 0;
    setTimeout(createBridge, 15000);
    return;
  }

  retryCount++;
  console.log(`🔁 Retry ${retryCount}/${maxRetries} in ${retryDelay}ms`);
  setTimeout(() => {
    if (!isConnected) {
      createBridge();
    }
  }, retryDelay);
}

function startHeartbeat() {
  heartBeatInterval = setInterval(() => {
    if (!isConnected || !bridge || bridge.readyState !== WebSocket.OPEN) {
      if (heartBeatInterval) clearInterval(heartBeatInterval);
      return;
    }

    try {
      bridge.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));

      heartBeatTimeout = setTimeout(() => {
        console.warn("💔 Heartbeat timed out. Closing bridge.");
        bridge?.terminate();
        isConnected = false;
        reconnectBridge();
      }, 5000);
    } catch (err) {
      console.error("❌ Failed to send heartbeat:", err);
    }
  }, heartBeatInterValInMS);
}
