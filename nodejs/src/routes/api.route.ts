import { Router } from 'express';

// Router
import securityGateRouter from './securityGate.route';
import employeeRouter from './employee.route';
import userRouter from './user.route';

const apiRouter = Router();

apiRouter.use('/security-gate', securityGateRouter);
apiRouter.use('/employee', employeeRouter);
apiRouter.use('/user', userRouter);

export default apiRouter;
