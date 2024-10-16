"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.ffmpegCommand = void 0;
// Packages
var fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
// Utils
var ffmpeg_util_1 = require("../utils/ffmpeg.util");
// Configs
var ffmpeg_config_1 = require("../config/ffmpeg.config");
//
// Video filter config
//
var videoFilterConfig = {
    text: '%{localtime}',
    fontcolor: ffmpeg_config_1.DRAWTEXT_COLOR,
    fontfile: ffmpeg_config_1.DRAWTEXT_FONTPATH,
    fontsize: ffmpeg_config_1.FONTSIZE,
    x: ffmpeg_config_1.FRAME_PADDING_X,
    y: ffmpeg_config_1.FRAME_PADDING_Y,
};
var videoFilterConfig2 = __assign(__assign({}, videoFilterConfig), { text: 'SecurityCam', get x() {
        return parseInt(ffmpeg_config_1.FRAMESIZE_WIDTH - ffmpeg_config_1.FONTSIZE * (19 / 30) * this.text.length + '');
    } });
//
// Initial ffmpeg service
//
exports.ffmpegCommand = (0, fluent_ffmpeg_1.default)({ priority: 0 })
    // .setFfprobePath(ffprobeStatic.path)
    // .setFfmpegPath(ffmpegStatic || '')
    //.input(readStreamEsp32CamSecurityGateImg)
    .input('http://localhost:8001')
    //.inputOptions(["-display_rotation 90", "-re"])
    .inputOptions(['-re'])
    .withNativeFramerate()
    .withNoAudio()
    .withSize((0, ffmpeg_util_1.reverseFrameSize)(ffmpeg_config_1.FRAMESIZE))
    .nativeFramerate()
    .outputOptions([
    '-preset ultrafast',
    '-c:v libx264',
    "-vf " +
        //`hflip,` +
        "drawtext=".concat((0, ffmpeg_util_1.convertObjectConfigToString)(videoFilterConfig, '=', ':'), ",") +
        "drawtext=".concat((0, ffmpeg_util_1.convertObjectConfigToString)(videoFilterConfig2, '=', ':')),
    '-b:v 2M',
    '-fps_mode auto',
    '-pix_fmt yuv420p',
    '-frame_drop_threshold -5.0',
    '-thread_queue_size 1M', // Từng gây lỗi khi chạy trong docker
])
    .noAudio()
    .format('flv')
    .output(ffmpeg_config_1.RTMP_SERVER_URL)
    .on('start', ffmpeg_util_1.handleStart)
    .on('codecData', ffmpeg_util_1.handleCodecData)
    .on('progress', ffmpeg_util_1.handleProgress)
    .on('end', ffmpeg_util_1.handleEnd)
    .on('error', ffmpeg_util_1.handleError);
var run = function () {
    exports.ffmpegCommand.run();
};
exports.run = run;
