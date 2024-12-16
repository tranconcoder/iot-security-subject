import type { Request } from 'express';
import type { WebSocketCustom } from '../types/ws';

// Websocket
import url from 'url';
import { WebSocketServer } from 'ws';
import { WebSocketSourceEnum } from '../enums/ws.enum';
// Analytics
import { WebsocketAnalytics } from './websocketAnalytics.service';
// Stream
import {
	readStreamEsp32CamMonitorImg,
	readStreamEsp32CamSecurityGateImg,
} from './stream.service';
import AESModel from '../config/database/schema/AES.schema';
import aes from 'js-crypto-aes';

const websocketAnalytics = new WebsocketAnalytics(0, 0, 10_000);
websocketAnalytics.startAnalytics();

const iv = '1234567890123456';

export default function runWebsocketService(
	wss: WebSocketServer,
	HOST: string,
	PORT: number
) {
	wss.on(
		'connection',
		async function connection(ws: WebSocketCustom, req: Request) {
			// Validate connection
			const { query } = url.parse(req.url, true);
			let source = query.source || WebSocketSourceEnum.INVALID_SOURCE;
			if (Array.isArray(source)) source = source[0];

			// Check API key
			const apiKey = req.headers['x-api-key'];

			if (!apiKey) {
				console.log('API key is required!');
				ws.close();
				return;
			}

			const keys = await AESModel.findOne({ apiKey }).lean();

			if (!keys) {
				console.log('API key is invalid!');
				ws.close();
				return;
			}

			// Set connection state
			ws.source = source as string;
			ws.on('error', console.error);
			switch (ws.source) {
				case WebSocketSourceEnum.ESP32CAM_SECURITY_GATE_SEND_IMG:
					// Handle append video frames to stream
					ws.on('message', async function message(buffer: Buffer) {
						aes
							.decrypt(buffer, Buffer.from(keys.secretKey), {
								name: 'AES-CBC',
								iv: Uint8Array.from(Buffer.from(iv, 'ascii')),
							})
							.then((decrypted) => {
								console.log(decrypted);
							});
					});
					break;

				case WebSocketSourceEnum.ESP32CAM_MONITOR_SEND_IMG:
					ws.on('message', async function message(buffer: Buffer) {
						readStreamEsp32CamMonitorImg.push(buffer);
					});
					break;

				case WebSocketSourceEnum.INVALID_SOURCE:
				default:
					console.log('Source is not valid!');
					ws.close();
			}
		}
	);

	wss.on('listening', () => {
		console.log(`WebSocket Server is listening on ws://${HOST}:${PORT}`);
	});

	wss.on('error', console.log);

	wss.on('close', () => {
		console.log('Websocket is closed!');
	});
}
