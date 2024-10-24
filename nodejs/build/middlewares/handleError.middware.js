"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchError = void 0;
var catchError = function (cb) {
    return function (req, res, next) {
        cb(req, res, next).catch(next);
    };
};
exports.catchError = catchError;
