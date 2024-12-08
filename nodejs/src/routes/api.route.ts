import { Router } from 'express';

// Router
import securityGateRouter from './securityGate.route';
import employeeRouter from './employee.route';
import userRouter from './user.route';
import environmentRouter from './environment.route';
import authRouter from './auth.route';

const apiRouter = Router();

apiRouter.use('/security-gate', securityGateRouter);
apiRouter.use('/employee', employeeRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/environment', environmentRouter);
apiRouter.use('/auth', authRouter);

export default apiRouter;
