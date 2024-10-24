"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FACE_RECOGNITION_SERVER_PORT = exports.FACE_RECOGNITION_SERVER_HOST = exports.MEDIA_SERVER_OUTPUT_PORT = exports.MEDIA_SERVER_INPUT_PORT = exports.MEDIA_SERVER_HOST_IP = exports.MEDIA_SERVER_HOST = exports.PORT = exports.HOST = exports.NODE_ENV = void 0;
require("dotenv/config");
var dotenv_1 = __importDefault(require("dotenv"));
exports.NODE_ENV = process.env.NODE_ENV || 'development';
dotenv_1.default.config({ path: ".env.".concat(exports.NODE_ENV) });
exports.HOST = process.env.HOST || '0.0.0.0';
exports.PORT = Number(process.env.PORT) || 3000;
// Media server
exports.MEDIA_SERVER_HOST = process.env.MEDIA_SERVER_HOST || '0.0.0.0';
exports.MEDIA_SERVER_HOST_IP = process.env.MEDIA_SERVER_HOST_IP || '0.0.0.0';
exports.MEDIA_SERVER_INPUT_PORT = Number(process.env.MEDIA_SERVER_INPUT_PORT) || 1935;
exports.MEDIA_SERVER_OUTPUT_PORT = Number(process.env.MEDIA_SERVER_OUTPUT_PORT) || 8000;
// Face recognition server
exports.FACE_RECOGNITION_SERVER_HOST = process.env.FACE_RECOGNITION_SERVER_HOST || '0.0.0.0';
exports.FACE_RECOGNITION_SERVER_PORT = process.env.FACE_RECOGNITION_SERVER_PORT || 5001;
