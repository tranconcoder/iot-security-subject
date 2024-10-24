"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfoEnvironmentParamSchema = void 0;
var joi_1 = __importDefault(require("joi"));
exports.getInfoEnvironmentParamSchema = joi_1.default.object({
    year: joi_1.default.number().required().max(new Date().getFullYear()),
    month: joi_1.default.number().min(1).max(12),
    week: joi_1.default.number().min(1).max(53),
    day: joi_1.default.number()
        .min(1)
        .max(31)
        .messages({
        "month.required": "required month when input date",
    })
        .custom(function (value, helpers) {
        var month = helpers.state.ancestors[0].month;
        if (!month)
            return helpers.error("any.invalid", {
                customMessage: "Month is required when input date!",
            });
        return +value;
    }),
});
