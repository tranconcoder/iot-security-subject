"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express
var express_1 = require("express");
// Controller
var employee_controller_1 = __importDefault(require("../controllers/employee.controller"));
var employeeRouter = (0, express_1.Router)();
var employeeController = new employee_controller_1.default();
/* employeeRouter.post(
    "/upload-face",
    uploadFaceMiddleware,
    employeeController.uploadFace
);
employeeRouter.post(
    "/recognition-face",
    uploadRecognitionFaceMiddleware,
    employeeController.uploadRecognitionFace
); */
exports.default = employeeRouter;
