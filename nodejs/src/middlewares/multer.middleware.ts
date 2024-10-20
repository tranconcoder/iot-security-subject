import type { RequestHandler } from "express";
import { RequestForbiddenError } from "../config/handleError.config";
import { uploadFace, uploadNewFaces } from "../config/multer.config";
import { catchError } from "./handleError.middware";

export const validateMinFile = (min: number): RequestHandler => {
    return (req, _, next) => {
        const fileCount = req.files?.length || 0;
        console.log(req.files);

        if (fileCount < min)
            throw new RequestForbiddenError(
                `Files count must be greater or equal than ${min}.`
            );

        next();
    };
};

export const uploadNewFacesMiddleware = [
    uploadNewFaces.array("faces"),
    validateMinFile(12),
].map((fn) => catchError(fn));

export const uploadRecognitionFaceMiddleware = uploadFace.single("face-img");
