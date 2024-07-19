import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const connectDB = async () => {
    const dburl = process.env.MONGO_URI;
    try {
        await mongoose.connect(dburl);
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;