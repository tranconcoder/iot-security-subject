"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFaceBodyPayloadSchema = exports.authDoorSchema = void 0;
var authDoor_joiSchema_1 = require("./authDoor.joiSchema");
Object.defineProperty(exports, "authDoorSchema", { enumerable: true, get: function () { return __importDefault(authDoor_joiSchema_1).default; } });
var addFaceBodyPayload_joiSchema_1 = require("./addFaceBodyPayload.joiSchema");
Object.defineProperty(exports, "addFaceBodyPayloadSchema", { enumerable: true, get: function () { return __importDefault(addFaceBodyPayload_joiSchema_1).default; } });
