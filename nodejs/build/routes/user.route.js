"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var user_controller_1 = __importDefault(require("../controllers/user.controller"));
var handleError_middware_1 = require("../middlewares/handleError.middware");
var multer_middleware_1 = require("../middlewares/multer.middleware");
var userRouter = (0, express_1.Router)();
userRouter.post("/add", multer_middleware_1.uploadNewFacesMiddleware, (0, handleError_middware_1.catchError)(user_controller_1.default.addUser));
exports.default = userRouter;
