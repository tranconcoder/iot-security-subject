"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var security_gate_route_1 = __importDefault(require("./security-gate.route"));
var employee_route_1 = __importDefault(require("./employee.route"));
var apiRouter = (0, express_1.Router)();
apiRouter.use("/security-gate", security_gate_route_1.default);
apiRouter.use("/employee", employee_route_1.default);
exports.default = apiRouter;
