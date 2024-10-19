import { uploadFace, uploadNewFaces } from '../config/multer.config';

export const uploadNewFacesMiddleware = uploadNewFaces.array('faces', 12);

export const uploadRecognitionFaceMiddleware = uploadFace.single('face-img');
