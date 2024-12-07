import mongoose from 'mongoose';
import 'dotenv/config';

export default function connectDb() {
	return mongoose.connect(
		`mongodb+srv://tranvanconkg:JAZpjGcNQlksfeuQ@cluster0.i74lv.mongodb.net/`
	);
}
