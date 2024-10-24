"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var environment_controller_1 = require("../controllers/environment.controller");
var handleError_middware_1 = require("../middlewares/handleError.middware");
var environmentRouter = (0, express_1.Router)();
environmentRouter.get("/get-info", (0, handleError_middware_1.catchError)(environment_controller_1.EnvironmentController.getInfo));
exports.default = environmentRouter;
