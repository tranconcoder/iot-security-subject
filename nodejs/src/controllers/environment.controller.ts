import type { Request, Response, NextFunction } from "express";
import { EnvironmentModel } from "../config/database/schema/environment.schema";
import { getInfoEnvironmentParamSchema } from "../config/joiSchema/getInfoEnvironment.joiSchema";

export class EnvironmentController {
    public static async getInfo(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const date = await getInfoEnvironmentParamSchema.validateAsync(
            req.params
        );

        const lastInfo = await EnvironmentModel.findOne(
            {},
            {},
            { sort: { created_at: -1 } }
        ).lean();

        res.status(200).json(lastInfo);
    }
}
