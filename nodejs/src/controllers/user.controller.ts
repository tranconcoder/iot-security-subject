import type { Request, Response, NextFunction } from 'express';
import UserServices from '../services/user.service';

export class UserController {
	public static async addUser(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		console.log(req.files);

		await UserServices.addUser();

		res.send(200).json({ status: 200 });
	}
}
