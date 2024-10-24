"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.ffmpegCommandMonitor = exports.ffmpegCommandSecurityGate = void 0;
// Packages
var fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
// Stream
var stream_service_1 = require("./stream.service");
// Utils
var ffmpeg_util_1 = require("../utils/ffmpeg.util");
// Configs
var ffmpeg_config_1 = require("../config/ffmpeg.config");
// Video filter config
var ffmpeg_config_2 = require("../config/ffmpeg.config");
//
// Initial ffmpeg service
//
exports.ffmpegCommandSecurityGate = (0, fluent_ffmpeg_1.default)({ priority: 0 })
    .input(stream_service_1.readStreamEsp32CamSecurityGateImg)
    .inputOptions(["-re"])
    .withNativeFramerate()
    .withNoAudio()
    .withSize((0, ffmpeg_util_1.reverseFrameSize)(ffmpeg_config_1.FRAMESIZE))
    .nativeFramerate()
    .noAudio()
    .outputOptions([
    "-preset ultrafast",
    "-c:v libx264",
    "-vf " +
        //`hflip,` +
        "drawtext=".concat((0, ffmpeg_util_1.convertObjectConfigToString)(ffmpeg_config_2.timeFilterConfig, "=", ":"), ",") +
        "drawtext=".concat((0, ffmpeg_util_1.convertObjectConfigToString)(ffmpeg_config_2.securityGateFilterConfig, "=", ":")),
    "-b:v 2M",
    "-fps_mode auto",
    "-pix_fmt yuv420p",
    "-frame_drop_threshold -5.0",
    // '-thread_queue_size 1M', // Từng gây lỗi khi chạy trong docker
])
    .format("flv")
    .output(ffmpeg_config_1.RTMP_SECURITY_GATE_URL)
    .on("start", ffmpeg_util_1.handleStart)
    .on("codecData", ffmpeg_util_1.handleCodecData)
    .on("progress", ffmpeg_util_1.handleProgress)
    .on("end", ffmpeg_util_1.handleEnd)
    .on("error", ffmpeg_util_1.handleError);
exports.ffmpegCommandMonitor = (0, fluent_ffmpeg_1.default)({ priority: 1 })
    .input(stream_service_1.readStreamEsp32CamMonitorImg)
    .inputOptions(["-re"])
    .withNativeFramerate()
    .withNoAudio()
    .withSize((0, ffmpeg_util_1.reverseFrameSize)(ffmpeg_config_1.FRAMESIZE))
    .nativeFramerate()
    .noAudio()
    .outputOptions([
    "-preset medium",
    "-c:v libx264",
    "-vf " +
        //`hflip,` +
        "drawtext=".concat((0, ffmpeg_util_1.convertObjectConfigToString)(ffmpeg_config_2.timeFilterConfig, "=", ":"), ",") +
        "drawtext=".concat((0, ffmpeg_util_1.convertObjectConfigToString)(ffmpeg_config_2.monitorFilterConfig, "=", ":")),
    "-b:v 1M",
    "-r 20",
    "-fps_mode auto",
    "-pix_fmt yuv420p",
    "-frame_drop_threshold -5.0",
    // '-thread_queue_size 1M', // Từng gây lỗi khi chạy trong docker
])
    .format("flv")
    .output(ffmpeg_config_1.RTMP_MONITOR_URL)
    .on("start", ffmpeg_util_1.handleStart)
    .on("codecData", ffmpeg_util_1.handleCodecData)
    .on("progress", ffmpeg_util_1.handleProgress)
    .on("end", ffmpeg_util_1.handleEnd)
    .on("error", ffmpeg_util_1.handleError);
var run = function () {
    exports.ffmpegCommandSecurityGate.run();
    exports.ffmpegCommandMonitor.run();
};
exports.run = run;
