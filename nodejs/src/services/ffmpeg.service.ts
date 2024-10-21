// Packages
import Ffmpeg from 'fluent-ffmpeg';
// Stream
import {
	readStreamEsp32CamMonitorImg,
	readStreamEsp32CamSecurityGateImg,
} from './stream.service';
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
	FRAMESIZE,
	RTMP_MONITOR_URL,
	RTMP_SECURITY_GATE_URL,
} from '../config/ffmpeg.config';
// Video filter config
import {
	securityGateFilterConfig,
	timeFilterConfig,
	monitorFilterConfig,
} from '../config/ffmpeg.config';

//
// Initial ffmpeg service
//
const ffmpegCommandBase = Ffmpeg({ priority: 0 })
	.inputOptions(['-re'])
	.withNativeFramerate()
	.withNoAudio()
	.withSize(reverseFrameSize(FRAMESIZE))
	.nativeFramerate()
	.noAudio()
	.format('flv')
	.on('start', handleStart)
	.on('codecData', handleCodecData)
	.on('progress', handleProgress)
	.on('end', handleEnd)
	.on('error', handleError);

export const ffmpegCommandSecurityGate = ffmpegCommandBase
	.clone()
	.input(readStreamEsp32CamSecurityGateImg)
	.outputOptions([
		'-preset ultrafast',
		'-c:v libx264',
		`-vf ` +
			//`hflip,` +
			`drawtext=${convertObjectConfigToString(
				timeFilterConfig,
				'=',
				':'
			)},` +
			`drawtext=${convertObjectConfigToString(
				securityGateFilterConfig,
				'=',
				':'
			)}`,
		'-b:v 2M',
		'-fps_mode auto',
		'-pix_fmt yuv420p',
		'-frame_drop_threshold -5.0',
		// '-thread_queue_size 1M', // Từng gây lỗi khi chạy trong docker
	])
	.output(RTMP_SECURITY_GATE_URL);

export const ffmpegCommandMonitor = ffmpegCommandBase
	.clone()
	.input(readStreamEsp32CamMonitorImg)
	.outputOptions([
		'-preset medium ',
		'-c:v libx264',
		`-vf ` +
			//`hflip,` +
			`drawtext=${convertObjectConfigToString(
				timeFilterConfig,
				'=',
				':'
			)},` +
			`drawtext=${convertObjectConfigToString(
				monitorFilterConfig,
				'=',
				':'
			)}`,
		'-b:v 1M',
		'-r 20',
		'-fps_mode auto',
		'-pix_fmt yuv420p',
		'-frame_drop_threshold -5.0',
		// '-thread_queue_size 1M', // Từng gây lỗi khi chạy trong docker
	])
	.output(RTMP_MONITOR_URL);

export const run = () => {
	ffmpegCommandSecurityGate.run();
	ffmpegCommandMonitor.run();
};
