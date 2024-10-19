"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTMP_SERVER_URL = exports.RTMP_LIVE_NAME = exports.DRAWTEXT_FONTPATH = exports.DRAWTEXT_COLOR = exports.LINE_MARGIN_SIZE = exports.FONTSIZE = exports.FRAME_PADDING_Y = exports.FRAME_PADDING_X = exports.FRAMESIZE_WIDTH = exports.FRAMESIZE_HEIGHT = exports.FRAMESIZE = exports.FRAMESIZES = exports.FFPROBE_PATH = exports.FFMPEG_PATH = void 0;
var path_1 = __importDefault(require("path"));
var _1 = require(".");
// Bin file path
exports.FFMPEG_PATH = path_1.default.join(__dirname, '../assets/bin/fffmpeg/ffmpeg');
exports.FFPROBE_PATH = path_1.default.join(__dirname, '../assets/bin/fffmpeg/ffprobe');
exports.FRAMESIZES = {
    QCIF: '176x144',
    HQVGA: '240x176',
    _240X240: '240x240',
    QVGA: '320x240',
    CIF: '400x296',
    HVGA: '480x320',
    VGA: '640x480',
    SVGA: '800x600',
    XGA: '1024x768',
    HD: '1280x720',
};
exports.FRAMESIZE = exports.FRAMESIZES.VGA;
exports.FRAMESIZE_HEIGHT = (_a = exports.FRAMESIZE.split('x').map(function (x) { return Number(x); }), _a[0]), exports.FRAMESIZE_WIDTH = _a[1];
exports.FRAME_PADDING_X = 10;
exports.FRAME_PADDING_Y = 10;
exports.FONTSIZE = 18;
exports.LINE_MARGIN_SIZE = 3;
exports.DRAWTEXT_COLOR = 'white@0.8';
exports.DRAWTEXT_FONTPATH = path_1.default.join(__dirname, '../assets/fonts/CaskaydiaCoveNerdFontMono-Regular.ttf');
exports.RTMP_LIVE_NAME = 'livestream0';
exports.RTMP_SERVER_URL = "rtmp://".concat(_1.envConfig.MEDIA_SERVER_HOST, ":").concat(_1.envConfig.MEDIA_SERVER_INPUT_PORT, "/live/").concat(exports.RTMP_LIVE_NAME);
