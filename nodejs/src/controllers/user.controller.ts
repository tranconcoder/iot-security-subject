import type { Request, Response, NextFunction } from "express";
import UserServices from "../services/user.service";

export default class UserController {
    public static async addUser(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        console.log(req.files);

        await UserServices.addUser(req.files as Express.Multer.File[]);

        res.status(200).json({ status: 200 });
    }
}
