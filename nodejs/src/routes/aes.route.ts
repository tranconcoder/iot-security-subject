import { Router } from 'express';

const aesRouter = Router();

aesRouter.post('/init', (req, res) => {
	console.log(req.body);

	res.status(200).send('Success');
});

export default aesRouter;
