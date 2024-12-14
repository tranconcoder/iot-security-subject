import { Router } from 'express';

const aesRouter = Router();

aesRouter.put('/check-api-key', (req, res) => {
	console.log({ body_check: req.body });
	console.log(req.headers);

	res.status(200).send('Success');
});
aesRouter.post('/init', (req, res) => {
	console.log({ body: req.body });
	res.setHeader('X-API-KEY', 'new-api-key');

	res.status(200).send('123123123');
});

export default aesRouter;
