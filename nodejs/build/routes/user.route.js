"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multer_middleware_1 = require("../middlewares/multer.middleware");
var userRouter = (0, express_1.Router)();
userRouter.post('/add', multer_middleware_1.uploadNewFacesMiddleware);
exports.default = userRouter;
