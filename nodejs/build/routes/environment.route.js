"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var environment_controller_1 = require("../controllers/environment.controller");
var environmentRouter = (0, express_1.Router)();
environmentRouter.get("/get-temp", environment_controller_1.EnvironmentController.getTemp);
exports.default = environmentRouter;
