import type { Request, Response, NextFunction } from "express";
import { EnvironmentModel } from "../config/database/schema/environment.schema";

export class EnvironmentController {
    public static async getTemp(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const lastRecord = await EnvironmentModel.findOne(
            {},
            {},
            { sort: { created_at: -1 } }
        ).lean();

        res.status(200).json(lastRecord);
    }
}
