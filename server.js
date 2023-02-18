import app from "./app.js";
import { connectDB } from "./config/db.js";
import RazorPay from 'razorpay';

import cloudinary from 'cloudinary';
import nodeCron from "node-cron";
import { Stats } from "./models/DashboardStat.js";

connectDB();

cloudinary.v2.config({
    cloud_name:process.env.CLOUDNAME,
    api_key:process.env.CLOUDAPIKEY,
    api_secret:process.env.CLOUDAPISECRET,
})

export const instance=new RazorPay({
    key_id: process.env.RAZORPAY_KEY_API,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  nodeCron.schedule("0 0 0 1 * * ",async()=>{
   try {
    await Stats.create({});


    
   } catch (error) {

    console.log(error);
    
   }
  })

const PORT=process.env.PORT;
app.listen(PORT,()=>(
    console.log(`server is running on ${PORT}`)

))