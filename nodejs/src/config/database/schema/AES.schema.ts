import { Schema, model, Document } from 'mongoose';

interface IAES extends Document {
	SKey: string;
	APIKEY: string;
	createdAt: Date;
}

const AESSchema = new Schema<IAES>({
	SKey: { type: String, required: true },
	APIKEY: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, expires: '10m' }, // Document expires after 10 minutes
});

const AESModel = model<IAES>('AES', AESSchema);

export default AESModel;
