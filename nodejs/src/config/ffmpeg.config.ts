import path from 'path';
import { envConfig } from '.';

// Bin file path
export const FFMPEG_PATH = path.join(__dirname, '../assets/bin/fffmpeg/ffmpeg');
export const FFPROBE_PATH = path.join(
	__dirname,
	'../assets/bin/fffmpeg/ffprobe'
);

export const FRAMESIZES = {
	QCIF: '176x144',
	HQVGA: '240x176',
	_240X240: '240x240',
	QVGA: '320x240',
	CIF: '400x296',
	HVGA: '480x320',
	VGA: '640x480',
	SVGA: '800x600',
	XGA: '1024x768',
	HD: '1280x720',
};

export const FRAMESIZE = FRAMESIZES.VGA;
export const [FRAMESIZE_HEIGHT, FRAMESIZE_WIDTH] = FRAMESIZE.split('x').map(
	(x) => Number(x)
);
export const FRAME_PADDING_X = 10;
export const FRAME_PADDING_Y = 10;
export const FONTSIZE = 18;
export const LINE_MARGIN_SIZE = 3;
export const DRAWTEXT_COLOR = 'white@0.8';
export const DRAWTEXT_FONTPATH = path.join(
	__dirname,
	'../assets/fonts/CaskaydiaCoveNerdFontMono-Regular.ttf'
);
export const RTMP_LIVE_NAME = 'livestream0';
export const RTMP_SERVER_URL = `rtmp://${envConfig.MEDIA_SERVER_HOST}:${envConfig.MEDIA_SERVER_PORT}/live/${RTMP_LIVE_NAME}`;
