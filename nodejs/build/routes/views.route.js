"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var viewsRouter = (0, express_1.Router)();
viewsRouter.get("/stream-cam-ffmpeg", function (_, res) {
    res.render("pages/stream-cam-ffmpeg");
});
viewsRouter.get("/stream-cam-flv", function (_, res) {
    res.render("pages/stream-cam-flv");
});
viewsRouter.get("/home", function (_, res) {
    res.render("pages/home-page");
});
exports.default = viewsRouter;
