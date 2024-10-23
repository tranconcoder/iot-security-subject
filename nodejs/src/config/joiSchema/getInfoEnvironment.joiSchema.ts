import Joi from "joi";

export const getInfoEnvironmentParamSchema = Joi.object({
    year: Joi.number().required().max(new Date().getFullYear()),
    month: Joi.number().min(1).max(12),
    date: Joi.number().min(1).max(31),
});
