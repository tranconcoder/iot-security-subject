export const MEDIA_SERVER_HOST = process.env.MEDIA_SERVER_HOST || "0.0.0.0";

export const MEDIA_SERVER_PORT = process.env.MEDIA_SERVER_PORT || 8000;

export const MEDIA_SERVER_RTMP = `rtmp://${MEDIA_SERVER_HOST}:${MEDIA_SERVER_PORT}`;

export const SERVER_HOST = process.env.SERVER_HOST || "0.0.0.0";
export const SERVER_PORT = process.env.SERVER_PORT || 3000;
