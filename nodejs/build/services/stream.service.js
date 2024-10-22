"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readStreamEsp32CamMonitorImg = exports.readStreamEsp32CamSecurityGateImg = void 0;
var node_stream_1 = require("node:stream");
exports.readStreamEsp32CamSecurityGateImg = new node_stream_1.Readable({
    read: function () { },
});
exports.readStreamEsp32CamMonitorImg = new node_stream_1.Readable({
    read: function () { },
});
