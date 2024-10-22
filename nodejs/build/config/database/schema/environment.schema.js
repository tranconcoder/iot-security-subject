"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceModel = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema;
var environmentSchema = new Schema({
    temp: {
        type: Number,
        required: true,
    },
    humidity: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});
exports.FaceModel = mongoose_1.default.model("Environment", environmentSchema);
