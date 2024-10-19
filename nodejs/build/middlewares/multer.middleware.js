"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRecognitionFaceMiddleware = exports.uploadNewFacesMiddleware = void 0;
var multer_config_1 = require("../config/multer.config");
exports.uploadNewFacesMiddleware = multer_config_1.uploadNewFaces.array('faces', 12);
exports.uploadRecognitionFaceMiddleware = multer_config_1.uploadFace.single('face-img');
