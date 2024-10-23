import { Router } from "express";
import { EnvironmentController } from "../controllers/environment.controller";
import { catchError } from "../middlewares/handleError.middware";

const environmentRouter = Router();

environmentRouter.get(
    "/get-info",
    catchError(EnvironmentController.getInfo)
);

export default environmentRouter;
