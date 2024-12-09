import type { Request, Response, NextFunction } from 'express';

// Validate
import authDoorSchema from '../config/joiSchema/authDoor.joiSchema';
import SecurityGateServices from '../services/securityGate.service';
import { RequestError } from '../config/handleError.config';
import { v4 } from 'uuid';
import bigInt from 'big-integer';
import AESModel from '../config/database/schema/AES.schema';

export default class SecurityGateController {
	public async authDoor(req: Request, res: Response, next: NextFunction) {
		const rfidSerialNumber = await authDoorSchema.validateAsync(req.body);

		SecurityGateServices.authDoor(rfidSerialNumber).catch(() => {
			throw new RequestError(400, 'Server error!');
		});
	}

	public async init(req: Request, res: Response, next: NextFunction) {
		let { pKey, gKey, AKey } = req.body;
		pKey = bigInt(pKey);
		gKey = bigInt(gKey);
		AKey = bigInt(AKey);

		const bKey = bigInt.randBetween(1, pKey.prev());
		const BKey = gKey.modPow(bKey, pKey);

		const SKey = AKey.modPow(bKey, pKey);

		if (isNaN(SKey)) {
			res.status(400).json({ message: 'Invalid request' });
			return;
		}

		const apiKey = v4();
		const AES = new AESModel({ SKey, APIKEY: apiKey });

		res.setHeader('X-API-KEY', apiKey);
		res.send(BKey);
		AES.save().then(() => {
			console.log('Save AES');
		});

		console.log({
			bKey: bKey.toString(),
			SKey: SKey.toString(),
			BKey: BKey.toString(),
			AKey: AKey.toString(),
			pKey: pKey.toString(),
			gKey: gKey.toString(),
		});
	}
}
