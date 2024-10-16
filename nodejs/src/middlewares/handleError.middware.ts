import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const catchError = (cb: RequestHandler) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			cb(req, res, next);
		} catch (err) {
			next(err);
		}
	};
};
