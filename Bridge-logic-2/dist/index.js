"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./server1");
require("./server2");
const bridge_1 = require("./bridge");
const reverseBridge_1 = require("./reverseBridge");
setTimeout(() => {
    (0, bridge_1.startBridge)(); // Server1 → Server2
    (0, reverseBridge_1.startReverseBridge)(); // Server2 → Server1
}, 1000);
