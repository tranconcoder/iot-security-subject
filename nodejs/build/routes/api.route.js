"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
// Router
var securityGate_route_1 = __importDefault(require("./securityGate.route"));
var employee_route_1 = __importDefault(require("./employee.route"));
var user_route_1 = __importDefault(require("./user.route"));
var environment_route_1 = __importDefault(require("./environment.route"));
var apiRouter = (0, express_1.Router)();
apiRouter.use('/security-gate', securityGate_route_1.default);
apiRouter.use('/employee', employee_route_1.default);
apiRouter.use('/user', user_route_1.default);
apiRouter.use("/environment", environment_route_1.default);
exports.default = apiRouter;
