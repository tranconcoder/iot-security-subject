"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketAnalytics = void 0;
var WebsocketAnalytics = /** @class */ (function () {
    function WebsocketAnalytics(initialData, initFrame, intervalTime) {
        if (initialData === void 0) { initialData = 0; }
        if (initFrame === void 0) { initFrame = 0; }
        if (intervalTime === void 0) { intervalTime = 10000; }
        this.totalData = initialData;
        this.intervalData = initialData;
        this.intervalFrame = initFrame;
        this.intervalTime = intervalTime;
    }
    WebsocketAnalytics.prototype.startAnalytics = function () {
        var _this = this;
        this.intervalId = setInterval(function () {
            console.log({
                frame: _this.intervalFrame / 10 + 'FPS',
                size: parseFloat(_this.intervalData / 1024 / 1024 + '').toFixed(2) + 'Mb',
                speedAvg: parseFloat(_this.intervalData / 10 / 1024 + '').toFixed(2) +
                    'Kbps',
            });
            _this.intervalData = _this.intervalFrame = 0;
        }, this.intervalTime);
    };
    WebsocketAnalytics.prototype.stopAnalytics = function () {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
    };
    WebsocketAnalytics.prototype.transferData = function (data, frame) {
        if (!this.intervalId)
            return console.log('Please start analysis before transfer data!');
        this.totalData += data;
        this.intervalData += data;
        this.intervalFrame += frame;
    };
    WebsocketAnalytics.prototype.clearIntervalData = function () {
        this.intervalData = 0;
        this.intervalFrame = 0;
    };
    WebsocketAnalytics.prototype.clearData = function () {
        this.totalData = 0;
        this.clearIntervalData();
    };
    return WebsocketAnalytics;
}());
exports.WebsocketAnalytics = WebsocketAnalytics;
