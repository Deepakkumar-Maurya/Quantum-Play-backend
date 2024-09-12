import mongoose from "mongoose";
import { addSalt } from "../helpers/auth.helper.js";

// ** user schema
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        salt: {
            type: String,
        },
        token: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// ** salt addition before saving the user
userSchema.pre("save", function(next) {
    addSalt(this, next);
});

const User = mongoose.model("User", userSchema);

export default User;
