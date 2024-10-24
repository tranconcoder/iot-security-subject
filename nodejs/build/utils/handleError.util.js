"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var handleError_config_1 = require("../config/handleError.config");
var colors_1 = __importDefault(require("colors"));
exports.default = (function handleError(error, req, res, next) {
    if (error instanceof Error)
        error = new handleError_config_1.RequestError(400, error.message);
    if (!(error instanceof handleError_config_1.RequestError))
        error = new handleError_config_1.RequestError(400, 'Unknown error!');
    console.error(colors_1.default.red(error.toString()));
    res.status(error.getStatusCode()).json(error.getInfo());
});
