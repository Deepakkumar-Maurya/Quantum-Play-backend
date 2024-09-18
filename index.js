import express from "express";
import cors from "cors";
import createHttpError from "http-errors";
import connectDB from "./config/db.js";
import Router from "./routes/routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

// ** global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ** db connection
connectDB();

// ** root route
app.use("/", Router);

// ** not found route
app.use((req, res, next) => {
    next(createHttpError.NotFound());
});

// ** error handler
app.use(errorHandler);

// ** server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
