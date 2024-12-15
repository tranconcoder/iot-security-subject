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
}
