import { Router } from 'express';
import { uploadNewFaces } from '../config/multer.config';
import { uploadNewFacesMiddleware } from '../middlewares/multer.middleware';

const userRouter = Router();

userRouter.post('/add', uploadNewFacesMiddleware);

export default userRouter;
