import { Cae } from "../middlewares/Cae.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { Stats } from "../models/DashboardStat.js";

import {sendEmail} from '../utils/sendMail.js'



export const contact=Cae(async(req,res,next)=>{

    const {name,email,message}=req.body

    if(!name||!email||!message) return next(new ErrorHandler("All Fields Are Mandotory"))

    const to=process.env.MY_MAIL

    const subject="Contact From NCC COURSE"

    const text=`${name} and my email is ${email} .\n${message}`;

    await sendEmail(to,subject,text);

    res.status(200).json({
        success:true,
        message:"Your Message Has been Sent"

    })

})


export const courseRequest=Cae(async(req,res,next)=>{

    const {name,email,course}=req.body

    if(!name||!email||!course) return next(new ErrorHandler("All Fields Are Mandotory"))


    const to=process.env.MY_MAIL

    const subject="Request For COURSE"

    const text=`${name} and my email is ${email} .\n${course}`;

    await sendEmail(to,subject,text);

    res.status(200).json({
        success:true,
        message:"Your Request Has been Sent"

    })

})


export const getDashboard=Cae(async(req,res,next)=>{

    const stats=await Stats.find({}).sort({createdAt:
    "desc"}).limit(12);

    const statsData=[];

   
    for (let i = 0; i < stats.length; i++) {
         statsData.unshift(stats[i]);
        
    }
    const requiredSize=12-stats.length;

    for (let i = 0; i < requiredSize; i++) {
        statsData.unshift({
            users:0,
            subscription:0,
            views:0,
        });
        
    }

    const userscount=statsData[11].users;
    const subscriptioncount=statsData[11].subscription;
    const viewscount=statsData[11].views;


    let usersProfit=true,
    viewsProfit=true,
    subscriptionProfit=true

    let usersPercetage=0,
    viewsPercetage=0,
    subscriptionPercetage=0

    if(statsData[10].users===0) usersPercetage=userscount*100;
    if(statsData[10].views===0) viewsPercetage=viewscount*100;
    if(statsData[10].subscription===0) subscriptionPercetage=subscriptioncount*100;

    else{
        const diff={
            users:statsData[11].users-statsData[10].users,
            views:statsData[11].views-statsData[10].views,
            subscription:statsData[11].subscription-statsData[10].subscription,
        }

        usersPercetage=(diff.users/statsData[10].users)*100;
       viewsPercetage=(diff.views/statsData[10].views)*100;
        subscriptionPercetage=(diff.subscription/statsData[10].subscription)*100;


        if(usersPercetage<0) usersProfit=false;
        if(subscriptionPercetage<0) subscriptionProfit=false;
        if(viewsPercetage<0) viewsProfit=false;
    }





    res.status(200).json({
        success:true,
        stats:statsData,
        userscount,
        subscriptioncount,
        viewscount,
        subscriptionPercetage,usersPercetage,viewsPercetage,
        viewsProfit,usersProfit,subscriptionProfit,

        
    })

})