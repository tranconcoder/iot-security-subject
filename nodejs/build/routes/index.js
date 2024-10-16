"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handleRoute;
var api_route_1 = __importDefault(require("./api.route"));
var views_route_1 = __importDefault(require("./views.route"));
function handleRoute(app) {
    app.use("/api", api_route_1.default);
    app.use("/views", views_route_1.default);
}
