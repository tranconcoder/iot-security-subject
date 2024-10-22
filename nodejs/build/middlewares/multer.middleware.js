"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRecognitionFaceMiddleware = exports.uploadNewFacesMiddleware = exports.validateMinFile = void 0;
var handleError_config_1 = require("../config/handleError.config");
var multer_config_1 = require("../config/multer.config");
var handleError_middware_1 = require("./handleError.middware");
var validateMinFile = function (min) {
    return function (req, _, next) {
        var files = req.files;
        var fileCount = files.length || 0;
        console.log(req.files);
        if (fileCount < min)
            throw new handleError_config_1.RequestForbiddenError("Files count must be greater or equal than ".concat(min, "."));
        next();
    };
};
exports.validateMinFile = validateMinFile;
exports.uploadNewFacesMiddleware = [
    multer_config_1.uploadNewFaces.array("faces"),
    (0, exports.validateMinFile)(12),
].map(function (fn) { return (0, handleError_middware_1.catchError)(fn); });
exports.uploadRecognitionFaceMiddleware = multer_config_1.uploadFace.single("face-img");
