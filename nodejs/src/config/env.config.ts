import 'dotenv/config';
import dotenv from 'dotenv';

export const NODE_ENV = process.env.NODE_ENV || 'development';

dotenv.config({ path: `.env.${NODE_ENV}` });

export const HOST = process.env.HOST || '0.0.0.0';
export const PORT = Number(process.env.PORT) || 3000;

// Media server
export const MEDIA_SERVER_HOST = process.env.MEDIA_SERVER_HOST || '0.0.0.0';
export const MEDIA_SERVER_PORT = Number(process.env.MEDIA_SERVER_PORT) || 1935;

// Face recognition server
export const FACE_RECOGNITION_HOST =
	process.env.FACE_RECOGNITION_HOST || '0.0.0.0';
export const FACE_RECOGNITION_PORT = process.env.FACE_RECOGNITION_PORT || 5001;
