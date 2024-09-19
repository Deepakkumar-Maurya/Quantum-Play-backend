import User from "../models/User.js";
import { matchPassword, generateAuthToken, compareTokenAndUser } from "../helpers/auth.helper.js";
import { sendForgetPwdMail } from "../helpers/email.helper.js";
import createHttpError from "http-errors";

const signup = async (req, res, next) => {
    try {
        // ** input validations
        if (!req.body.username || !req.body.email || !req.body.password) {
            throw createHttpError.BadRequest("Please fill all the fields");
        }
        if (req.body.password.length < 4) {
            throw createHttpError.BadRequest(
                "Password must be at least 4 characters"
            );
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            throw createHttpError.BadRequest(
                "Please enter a valid email address"
            );
        }
        if (req.body.username.length < 3) {
            throw createHttpError.BadRequest(
                "Username must be at least 3 characters"
            );
        }

        const { username, email, password } = req.body;

        // ** check if user already exists
        const user = await User.findOne({ email: email });
        if (user) {
            throw createHttpError.Conflict("User already exists");
        }

        // ** create a new user
        const newUser = new User({
            username: username,
            email: email,
            password: password,
        });
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User created successfully",
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

const signin = async (req, res, next) => {
    try {
        // ** input validations
        if (!req.body.email || !req.body.password) {
            throw createHttpError.BadRequest("Please fill all the fields");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            throw createHttpError.BadRequest("Please enter a valid email");
        }

        const { email, password } = req.body;

        // ** check if user exists
        const user = await User.findOne({ email: email });
        if (!user) {
            throw createHttpError.NotFound("No such user found");
        }

        // ** match password
        const isMatch = matchPassword(user, password);
        if (!isMatch) {
            throw createHttpError.Unauthorized("Invalid password");
        }

        const isForgetPwd = false;

        // ** generate a token
        const token = await generateAuthToken(user, isForgetPwd);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 days
        });

        return res.status(200).json({
            success: true,
            message: "User signed in successfully",
            token: token,
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        // ** clear the token
        res.clearCookie("token");

        // ** update the token
        await User.updateOne({ _id: req.params.id }, { token: "" });

        return res.status(200).json({
            success: true,
            message: "User signed out successfully",
        });
    } catch (error) {
        next(error);
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            throw createHttpError.NotFound(
                `No such user found with this email ${email}`
            );
        }

        const isForgetPwd = true;

        // ** generate a token
        const resetToken = await generateAuthToken(user, isForgetPwd);

        // ** save the token in db
        await User.updateOne({ _id: user.id }, { token: resetToken });

        const resetURL = `${req.protocol}://${req.get(
            "host"
        )}/auth/resetpassword/${resetToken}`;

        const isMailSent = await sendForgetPwdMail(email, resetURL);
        if (!isMailSent.success) {
            throw createHttpError.InternalServerError(
                `Error while sending mail to ${email}`
            );
        }

        return res.status(200).json({
            success: true,
            message:
                "A link has been sent to your email having validity of 2 minutes. Please click on the link to reset your password",
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const resetToken = req.params.resetToken;
        const { newPassword } = req.body;

        const isMatch = await compareTokenAndUser(resetToken);
        if (!isMatch.success) {
            throw createHttpError.BadRequest(isMatch.error);
        }

        const user = isMatch.user;
        user.password = newPassword;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        next(error);
    }
};

export { signup, signin, logout, forgetPassword, resetPassword };
