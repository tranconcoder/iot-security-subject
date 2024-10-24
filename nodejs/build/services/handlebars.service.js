"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var express_handlebars_1 = require("express-handlebars");
var handlebars_util_1 = __importDefault(require("../utils/handlebars.util"));
var SetupHandlebars = /** @class */ (function () {
    function SetupHandlebars(app) {
        this.app = app;
        this.exHandlebars = (0, express_handlebars_1.create)({
            extname: '.hbs',
            helpers: handlebars_util_1.default,
        });
    }
    SetupHandlebars.prototype.setup = function () {
        this.app.engine('.hbs', this.exHandlebars.engine);
        this.app.set('view engine', '.hbs');
        this.app.set('views', path_1.default.join(__dirname, '../views'));
    };
    return SetupHandlebars;
}());
exports.default = SetupHandlebars;
