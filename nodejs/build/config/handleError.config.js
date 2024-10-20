"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestForbiddenError = exports.RequestPayloadInvalidError = exports.RequestNotFoundError = exports.RequestError = void 0;
var RequestError = /** @class */ (function () {
    function RequestError(statusCode, message) {
        this.statusCode = statusCode;
        this.message = message;
    }
    RequestError.prototype.getStatusCode = function () {
        return this.statusCode;
    };
    RequestError.prototype.getMessage = function () {
        return this.message;
    };
    RequestError.prototype.toString = function () {
        return "ERROR: ".concat(this.getStatusCode(), " ").concat(this.getMessage());
    };
    RequestError.prototype.getInfo = function () {
        return {
            code: this.getStatusCode(),
            message: this.getMessage(),
            error: true,
        };
    };
    return RequestError;
}());
exports.RequestError = RequestError;
var RequestNotFoundError = /** @class */ (function (_super) {
    __extends(RequestNotFoundError, _super);
    function RequestNotFoundError(message) {
        return _super.call(this, 404, message) || this;
    }
    return RequestNotFoundError;
}(RequestError));
exports.RequestNotFoundError = RequestNotFoundError;
var RequestPayloadInvalidError = /** @class */ (function (_super) {
    __extends(RequestPayloadInvalidError, _super);
    function RequestPayloadInvalidError(message) {
        return _super.call(this, 422, message) || this;
    }
    return RequestPayloadInvalidError;
}(RequestError));
exports.RequestPayloadInvalidError = RequestPayloadInvalidError;
var RequestForbiddenError = /** @class */ (function (_super) {
    __extends(RequestForbiddenError, _super);
    function RequestForbiddenError(message) {
        return _super.call(this, 403, message) || this;
    }
    return RequestForbiddenError;
}(RequestError));
exports.RequestForbiddenError = RequestForbiddenError;
