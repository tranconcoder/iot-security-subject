"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runWebsocketService;
// Websocket
var url_1 = __importDefault(require("url"));
var uuid_1 = require("uuid");
var ws_enum_1 = require("../enums/ws.enum");
// Analytics
var websocketAnalytics_service_1 = require("./websocketAnalytics.service");
// Stream
var stream_service_1 = require("./stream.service");
var websocketAnalytics = new websocketAnalytics_service_1.WebsocketAnalytics(0, 0, 10000);
websocketAnalytics.startAnalytics();
function runWebsocketService(wss, HOST, PORT) {
    wss.on('connection', function connection(ws, req) {
        // Validate connection
        var query = url_1.default.parse(req.url, true).query;
        var source = query.source || ws_enum_1.WebSocketSourceEnum.INVALID_SOURCE;
        if (Array.isArray(source))
            source = source[0];
        // Set connection state
        ws.id = (0, uuid_1.v4)();
        ws.source = source;
        ws.on('error', console.error);
        console.log("Client ".concat(ws.id, " connected"));
        switch (ws.source) {
            case ws_enum_1.WebSocketSourceEnum.ESP32CAM_SECURITY_GATE_SEND_IMG:
                // Handle append video frames to stream
                ws.on('message', function message(buffer) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            websocketAnalytics.transferData(buffer.byteLength, 1);
                            stream_service_1.readStreamEsp32CamSecurityGateImg.push(buffer);
                            return [2 /*return*/];
                        });
                    });
                });
                break;
            case ws_enum_1.WebSocketSourceEnum.ESP32CAM_MONITOR_SEND_IMG:
                ws.on('message', function message(buffer) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            stream_service_1.readStreamEsp32CamMonitorImg.push(buffer);
                            return [2 /*return*/];
                        });
                    });
                });
                break;
            case ws_enum_1.WebSocketSourceEnum.INVALID_SOURCE:
            default:
                console.log('Source is not valid!');
                ws.close();
        }
    });
    wss.on('listening', function () {
        console.log("WebSocket Server is listening on ws://".concat(HOST, ":").concat(PORT));
    });
    wss.on('error', console.log);
    wss.on('close', function () {
        console.log('Websocket is closed!');
    });
}
