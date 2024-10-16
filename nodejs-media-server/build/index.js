"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_media_server_1 = __importDefault(require("node-media-server"));
const path_1 = __importDefault(require("path"));
const chunkTime = 30;
const nmsFfmpeg = new node_media_server_1.default({
    rtmp: {
        port: 1935,
        chunk_size: 128 * 1024,
        gop_cache: false,
        ping: 60,
        ping_timeout: 30,
    },
    http: {
        port: 8000,
        mediaroot: "./media",
        allow_origin: "*",
    },
    trans: {
        ffmpeg: path_1.default.join(__dirname, "./assets/bin/ffmpeg"),
        tasks: [
            {
                app: "live",
                hls: true,
                hlsFlags: `[hls_time=${chunkTime}:hls_list_size=${24 * 60 * (60 / chunkTime) // 24h
                }:hls_flags=split_by_time]`,
                hlsKeep: true,
                dash: true,
                dashFlags: "[f=dash:window_size=3:extra_window_size=5]",
                dashKeep: true,
            },
        ],
    },
});
nmsFfmpeg.run();
