import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const {MONGO_URI} = process.env;
if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
}

export const connectDb = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("db connected.")
    } catch (error) {
        console.error('Failed to connect db: ', error);
    }
}