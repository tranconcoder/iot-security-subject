import mongoose from "mongoose";

const { Schema } = mongoose;

const environmentSchema = new Schema(
    {
        temp: {
            type: Number,
            required: true,
        },
        humidity: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const FaceModel = mongoose.model("Environment", environmentSchema);
