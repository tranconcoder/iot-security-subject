import mongoose from "mongoose";
import "dotenv/config";

const PASSWORD = process.env.MONGODB_ATLAS_PASSWORD;

export default function connectDb() {
    return mongoose.connect(
        `mongodb+srv://tranvanconkg:JAZpjGcNQlksfeuQ@cluster0.i74lv.mongodb.net/`
    );
}
