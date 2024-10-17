"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchError = void 0;
var catchError = function (cb) {
    return function (req, res, next) {
        try {
            cb(req, res, next);
        }
        catch (err) {
            next(err);
        }
    };
};
exports.catchError = catchError;
