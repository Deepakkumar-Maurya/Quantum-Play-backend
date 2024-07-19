import express from "express";
import cors from "cors";
import connectDB from "./config/db";

const app = express();

// ** global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// ** server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})