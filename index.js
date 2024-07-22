import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import Router from "./routes/routes";

const app = express();

// ** global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ** db connection
connectDB();

// ** root route
app.use("/", Router);

// ** server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
