import type { Request, Response, NextFunction } from 'express';

// Validate
import { v4 } from 'uuid';
import bigInt from 'big-integer';
import AESModel from '../config/database/schema/AES.schema';

export default class AESController {
	public static async init(req: Request, res: Response, next: NextFunction) {
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
		console.log(apiKey);
		res.status(200).send(BKey.toString());
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

	public static async checkApiKey(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const apiKey = req.header('x-api-key');
		const apiKeyValid = await AESModel.findOne({ APIKEY: apiKey }).lean();

		console.log(apiKey);

		if (!apiKeyValid) res.status(400).json({ message: 'Invalid API key' });
		else res.status(200).send('OK');
	}
}
