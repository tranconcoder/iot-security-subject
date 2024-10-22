import type { Request, Response, NextFunction } from "express";
import { EnvironmentModel } from "../config/database/schema/environment.schema";
import {RequestError} from "../config/handleError.config";

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

        throw new RequestError(404, "Not found!~~~")

        res.status(200).json(lastRecord);
    }
}
