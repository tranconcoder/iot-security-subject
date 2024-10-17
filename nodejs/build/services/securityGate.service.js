"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SecurityGateServices = /** @class */ (function () {
    function SecurityGateServices() {
    }
    SecurityGateServices.authDoor = function (rfidSerialNumber) {
        console.log(rfidSerialNumber);
    };
    return SecurityGateServices;
}());
exports.default = SecurityGateServices;
