import "./server1";
import "./server2";
import { createBridge } from "./bridge";

setTimeout(() => {
  createBridge();
}, 10000);
