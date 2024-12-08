import type { Request, Response, NextFunction } from 'express';

// Validate
import authDoorSchema from '../config/joiSchema/authDoor.joiSchema';
import SecurityGateServices from '../services/securityGate.service';
import { RequestError } from '../config/handleError.config';

export default class SecurityGateController {
	public async authDoor(req: Request, res: Response, next: NextFunction) {
		const rfidSerialNumber = await authDoorSchema.validateAsync(req.body);

		SecurityGateServices.authDoor(rfidSerialNumber).catch(() => {
			throw new RequestError(400, 'Server error!');
		});
	}

	public async init(req: Request, res: Response, next: NextFunction) {
		const { pKey, gKey, AKey } = req.body;
		const bKey = Math.floor(Math.random() * 101);
		const BKey = Math.pow(gKey, bKey) % pKey;

		const SKey = Math.pow(AKey, bKey) % pKey;

		res.json({ BKey });

		console.log(SKey);
	}
}
