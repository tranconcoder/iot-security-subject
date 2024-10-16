// Types
import type { ConfigFilterVideo } from '../types/ffmpeg';
// Packages
import Ffmpeg from 'fluent-ffmpeg';
// Services
import { readStreamEsp32CamSecurityGateImg } from './websocket.service';
// Utils
import {
	convertObjectConfigToString,
	handleCodecData,
	handleEnd,
	handleError,
	handleProgress,
	handleStart,
	reverseFrameSize,
} from '../utils/ffmpeg.util';
// Configs
import {
	DRAWTEXT_COLOR,
	DRAWTEXT_FONTPATH,
	FFMPEG_PATH,
	FFPROBE_PATH,
	FONTSIZE,
	FRAMESIZE,
	FRAMESIZE_WIDTH,
	FRAME_PADDING_X,
	FRAME_PADDING_Y,
	RTMP_SERVER_URL,
} from '../config/ffmpeg.config';

//
// Video filter config
//
const videoFilterConfig: ConfigFilterVideo = {
	text: '%{localtime}',
	fontcolor: DRAWTEXT_COLOR,
	fontfile: DRAWTEXT_FONTPATH,
	fontsize: FONTSIZE,
	x: FRAME_PADDING_X,
	y: FRAME_PADDING_Y,
};
const videoFilterConfig2 = {
	...videoFilterConfig,
	text: 'SecurityCam',
	get x() {
		return parseInt(
			FRAMESIZE_WIDTH - FONTSIZE * (19 / 30) * this.text.length + ''
		);
	},
} as ConfigFilterVideo;

//
// Initial ffmpeg service
//
export const ffmpegCommand = Ffmpeg({ priority: 0 })
	.input(readStreamEsp32CamSecurityGateImg)
	//.inputOptions(["-display_rotation 90", "-re"])
	.inputOptions(['-re'])
	.withNativeFramerate()
	.withNoAudio()
	.withSize(reverseFrameSize(FRAMESIZE))
	.nativeFramerate()
	.outputOptions([
		'-preset ultrafast',
		'-c:v libx264',
		`-vf ` +
			//`hflip,` +
			`drawtext=${convertObjectConfigToString(
				videoFilterConfig,
				'=',
				':'
			)},` +
			`drawtext=${convertObjectConfigToString(
				videoFilterConfig2,
				'=',
				':'
			)}`,
		'-b:v 2M',
		'-fps_mode auto',
		'-pix_fmt yuv420p',
		'-frame_drop_threshold -5.0',
		// '-thread_queue_size 1M', // Từng gây lỗi khi chạy trong docker
	])
	.noAudio()
	.format('flv')
	.output(RTMP_SERVER_URL)
	.on('start', handleStart)
	.on('codecData', handleCodecData)
	.on('progress', handleProgress)
	.on('end', handleEnd)
	.on('error', handleError);

export const run = () => {
	ffmpegCommand.run();
};
