"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var userSchema = new mongoose_1.Schema({
    full_name: {
        type: String,
        required: true,
    },
    serial_number: {
        type: String,
        required: true,
    },
});
var UserModel = (0, mongoose_1.model)("User", userSchema);
exports.default = UserModel;
