import "./server1";
import "./server2";
import { startBridge } from "./bridge";
import { startReverseBridge } from "./reverseBridge";

setTimeout(() => {
  startBridge();         // Server1 → Server2
  startReverseBridge();  // Server2 → Server1
}, 1000);
