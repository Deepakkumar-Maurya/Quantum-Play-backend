import User from "../models/User.js";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        //** header check
        if (!authHeader || authHeader == null || authHeader === "") {
            throw createHttpError.Unauthorized("No token provided");
        }
        const token = authHeader?.split(" ")[1];

        // ** user verification
        const user = jwt.verify(token, process.env.JWT_SECRET);

        const userFromDB = await User.findById(user.id);
        if (!userFromDB) {
            throw createHttpError.Unauthorized("User not found");
        }
        if (userFromDB.token !== token) {
            throw createHttpError.Unauthorized("Invalid token");
        }

        // ** add user to request
        req.userId = user.id;
        next();
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export default isAuth;
