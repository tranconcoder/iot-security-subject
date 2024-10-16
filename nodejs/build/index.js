"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.HOST = exports.httpServer = exports.wss = void 0;
// Express app
var express_1 = __importDefault(require("express"));
var routes_1 = __importDefault(require("./routes"));
var body_parser_1 = __importDefault(require("body-parser"));
// Handlebars
var path_1 = __importDefault(require("path"));
var handlebars_service_1 = __importDefault(require("./services/handlebars.service"));
// Http server
var http_1 = require("http");
// Websocket Server
var websocket_service_1 = __importDefault(require("./services/websocket.service"));
var ws_1 = require("ws");
// Services
var ffmpegService = __importStar(require("./services/ffmpeg.service"));
// Morgan
var morgan_1 = __importDefault(require("morgan"));
// Mongoose
var mongoose_config_1 = __importDefault(require("./config/database/mongoose.config"));
// Error handler
var handleError_util_1 = __importDefault(require("./utils/handleError.util"));
// Environments
var config_1 = require("./config");
// Constants
var HOST = config_1.envConfig.HOST, PORT = config_1.envConfig.PORT;
exports.HOST = HOST;
exports.PORT = PORT;
// Server
var app = (0, express_1.default)();
var httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
var wss = new ws_1.WebSocketServer({
    server: httpServer,
    host: HOST,
    maxPayload: 256 * 1024,
});
exports.wss = wss;
//
// MORGAN
//
app.use((0, morgan_1.default)('tiny'));
//
// BODY PARSER
//
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.raw());
app.use(body_parser_1.default.text());
app.use(body_parser_1.default.json());
//
// STATIC FILES
//
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public')));
//
// HANDLEBARS
//
var setupExHbs = new handlebars_service_1.default(app);
setupExHbs.setup();
//
// HANDLE ROUTE
//
(0, routes_1.default)(app);
//
// RUN SERVICES
//
// Ffmpeg
ffmpegService.run();
// Websocket
(0, websocket_service_1.default)(wss, HOST, PORT);
//
// ERROR HANDLER
//
app.use(handleError_util_1.default);
//
// START SERVER
//
httpServer.listen(PORT, HOST, function () {
    console.log("Server is running on http://".concat(HOST, ":").concat(PORT));
});
//
// MONGOOSE
//
(0, mongoose_config_1.default)()
    .then(function () {
    console.log('Connected to database!');
})
    .catch(function () {
    console.log('Connect fail to database!');
});
