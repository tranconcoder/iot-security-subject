"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadNewFaces = exports.uploadFace = void 0;
var multer_1 = __importStar(require("multer"));
var handleError_config_1 = require("./handleError.config");
var imageFileFilter = function (_, file, callback) {
    var mimeTypeList = ["image/jpeg", "image/jpg", "image/png"];
    if (!mimeTypeList.includes(file.mimetype)) {
        callback(new handleError_config_1.RequestPayloadInvalidError("Mimetype not support!"), false);
        return;
    }
    callback(null, true);
};
var faceStorage = (0, multer_1.memoryStorage)();
exports.uploadFace = (0, multer_1.default)({
    storage: faceStorage,
    limits: {
        fileSize: 10 * Math.pow(1024, 2), // 10Mb
    },
    fileFilter: imageFileFilter,
});
exports.uploadNewFaces = (0, multer_1.default)({
    storage: (0, multer_1.memoryStorage)(),
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * Math.pow(1024, 2), // 10Mb
        files: 30,
    },
});
