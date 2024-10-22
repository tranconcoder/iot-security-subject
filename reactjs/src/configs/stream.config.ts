import { MEDIA_SERVER_HOST, MEDIA_SERVER_PORT } from "./env.config";

export const LIVE_STREAM_NAME = "livestream0";

export const LIVE_STREAM_PATH_FLV = `rtmp://${MEDIA_SERVER_HOST}:${MEDIA_SERVER_PORT}/live/${LIVE_STREAM_NAME}.flv`;

export const FRAME_SIZE_WIDTH = 640;
export const FRAME_SIZE_HEIGHT = 480;
