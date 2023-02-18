import mongoose from "mongoose";

export const connectDB=async()=>{
    mongoose.set('strictQuery', true);
    const connection=await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo is Connected successfully`);
}