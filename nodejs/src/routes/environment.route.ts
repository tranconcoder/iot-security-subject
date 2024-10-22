import { Router } from "express";
import { EnvironmentController } from "../controllers/environment.controller";

const environmentRouter = Router();

environmentRouter.get("/get-temp", EnvironmentController.getTemp);

export default environmentRouter;
