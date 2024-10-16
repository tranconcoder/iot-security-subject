"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var joi_1 = __importDefault(require("joi"));
var addFaceBodyPayloadSchema = joi_1.default.object({
    label: joi_1.default.string().hex().length(24),
});
exports.default = addFaceBodyPayloadSchema;
