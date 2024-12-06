import { model, Schema } from "mongoose";

const userSchema = new Schema({
    full_name: {
        type: String,
        required: true,
    },
    serial_number: {
        type: String,
        required: true,
    },
});

const UserModel = model("User", userSchema);

export default UserModel;
