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
export const ffmpegCommandSecurityGate = Ffmpeg({ priority: 0 })
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
	.noAudio()
	.format('flv')
	.output(RTMP_SECURITY_GATE_URL)
	.on('start', handleStart)
	.on('codecData', handleCodecData)
	.on('progress', handleProgress)
	.on('end', handleEnd)
	.on('error', handleError);

export const ffmpegCommandMonitor = Ffmpeg({ priority: 1 })
	.input(readStreamEsp32CamMonitorImg)
	.inputOptions(['-re'])
	.withNativeFramerate()
	.withNoAudio()
	.withSize(reverseFrameSize(FRAMESIZE))
	.nativeFramerate()
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
		'-b:v 4M',
		'-fps_mode auto',
		'-pix_fmt yuv420p',
		'-frame_drop_threshold -5.0',
		// '-thread_queue_size 1M', // Từng gây lỗi khi chạy trong docker
	])
	.noAudio()
	.format('flv')
	.output(RTMP_MONITOR_URL)
	.on('start', handleStart)
	.on('codecData', handleCodecData)
	.on('progress', handleProgress)
	.on('end', handleEnd)
	.on('error', handleError);

export const run = () => {
	ffmpegCommandSecurityGate.run();
	ffmpegCommandMonitor.run();
};
