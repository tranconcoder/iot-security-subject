"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var securityGate_controller_1 = __importDefault(require("../controllers/securityGate.controller"));
var securityGateRouter = (0, express_1.Router)();
var securityGateController = new securityGate_controller_1.default();
// securityGateRouter.post("/auth-door", securityGateController.authDoor);
exports.default = securityGateRouter;
