import type { Request, Response, NextFunction } from "express";

// Validate
import authDoorSchema from "../config/joiSchema/authDoor.joiSchema";
import SecurityGateServices from "../services/securityGate.service";

export default class SecurityGateController {
    public async authDoor(req: Request, res: Response, next: NextFunction) {
        const rfidSerialNumber = await authDoorSchema.validateAsync(req.body);

        SecurityGateServices.authDoor(rfidSerialNumber);
    }
}
