"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseFrameSize = exports.getEsp32CamSecurityGateSourcePath = exports.convertObjectConfigToString = exports.handleError = exports.handleEnd = exports.handleProgress = exports.handleCodecData = exports.handleStart = void 0;
var path_1 = __importDefault(require("path"));
var date_fns_1 = require("date-fns");
var fs_1 = __importDefault(require("fs"));
var handleStart = function (cmd) {
    console.log('Ffmpeg is started with output: ' + cmd.split(' ').at(-1));
};
exports.handleStart = handleStart;
var handleCodecData = function (_a) {
    var format = _a.format, video_details = _a.video_details;
    console.log("Encode started: format(".concat(format, "), resolution(").concat(video_details[3], "), fps(").concat(video_details[4], ")"));
};
exports.handleCodecData = handleCodecData;
var handleProgress = function (_a) {
    var frames = _a.frames, timemark = _a.timemark, targetSize = _a.targetSize;
    console.log("Progress: frames(".concat(frames, "), timemark(").concat(timemark, "), targetSize(").concat(parseFloat((targetSize / 1024).toString()).toFixed(2), "Mb)"));
};
exports.handleProgress = handleProgress;
var handleEnd = function () { return console.log('Finished'); };
exports.handleEnd = handleEnd;
var handleError = function (error) {
    return console.log("Encoding Error: ".concat(error.message));
};
exports.handleError = handleError;
var convertObjectConfigToString = function (config, symbol, separateSymbol) {
    var result = '';
    var configArr = Object.getOwnPropertyNames(config);
    configArr.forEach(function (property, index) {
        result += property + symbol + config[property];
        if (index < configArr.length - 1)
            result += separateSymbol;
    });
    return result;
};
exports.convertObjectConfigToString = convertObjectConfigToString;
var getEsp32CamSecurityGateSourcePath = function () {
    var directoryPath = path_1.default.join(__dirname, "../assets/videos/esp32_security_gate_cam/");
    var timestamp = (0, date_fns_1.format)(new Date(), 'ddMMyy_HH_mm_ss');
    if (!fs_1.default.existsSync(directoryPath))
        fs_1.default.mkdirSync(directoryPath, { recursive: true });
    return path_1.default.join(directoryPath, "security_gate_".concat(timestamp, ".mp4"));
};
exports.getEsp32CamSecurityGateSourcePath = getEsp32CamSecurityGateSourcePath;
var reverseFrameSize = function (frameSize) {
    return frameSize.split('x').reverse().join('x');
};
exports.reverseFrameSize = reverseFrameSize;
