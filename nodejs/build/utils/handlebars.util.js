"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = __importDefault(require("path"));
var config_1 = require("../config");
var exHbsHelpers = {
    loadCss: function (view) {
        var viewFileName = view.split('/').at(-1);
        var cssDirPath = path_1.default.join(__dirname, "../../public/css/".concat(viewFileName));
        var cssTags = '';
        if ((0, fs_1.existsSync)(cssDirPath) && (0, fs_1.lstatSync)(cssDirPath).isDirectory()) {
            var files = (0, fs_1.readdirSync)(cssDirPath);
            files.forEach(function (file) {
                if (file.endsWith('.css')) {
                    cssTags += "<link rel='stylesheet' href='/public/css/".concat(file, "' />\r\n");
                }
            });
        }
        return cssTags;
    },
    getMediaServerOutputPath: function () {
        return "".concat(config_1.envConfig.MEDIA_SERVER_HOST_IP, ":").concat(config_1.envConfig.MEDIA_SERVER_OUTPUT_PORT);
    },
};
exports.default = exHbsHelpers;
