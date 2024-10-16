"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRecognitionFaceMiddleware = exports.uploadFaceMiddleware = void 0;
var multer_config_1 = require("../config/multer.config");
exports.uploadFaceMiddleware = multer_config_1.uploadFace.array("face-img", 100);
exports.uploadRecognitionFaceMiddleware = multer_config_1.uploadRecognitionFace.single("face-img");
