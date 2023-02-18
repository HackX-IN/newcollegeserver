import { Cae } from "../middlewares/Cae.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import {instance} from '../server.js';
import crypto from 'crypto';
import { Payment } from "../models/Payment.js";



export const buySubscription=Cae(async(req,res,next)=>{
    const user=await User.findById(req.user._id);

    if(user.role==="admin") return next(new ErrorHandler("Admin Can't Buy Subscription",404))
    if(user.role==="newian") return next(new ErrorHandler("Newian Can't Buy Subscription",404))

    const plan_id=process.env.PLAN_ID || "plan_LClsgtcQ3ZtCD8"

    const subscription =await instance.subscriptions.create({
        plan_id: plan_id,
        customer_notify: 1,
        total_count: 12,
 
      });
      user.subscription.id=subscription.id;
      user.subscription.status=subscription.status;

      await user.save()

      res.status(200).json({
        success:true,
        subscriptionId:subscription.id,

      })


})

export const paymentVerifi=Cae(async(req,res,next)=>{

    const {razorpay_signature,razorpay_payment_id,razorpay_subscription_id}=req.body

    const user =await User.findById(req.user._id);

    const subscription_id=user.subscription.id;

    const generated_signature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(razorpay_payment_id+"|"+subscription_id,"utf-8").digest("hex")

    const isAuthentic=generated_signature===razorpay_signature;

    if(!isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`);

    //database comes

    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id

    })

    user.subscription.status="active";

    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?refernce=${razorpay_payment_id}`);


})

export const getRazorPAy=Cae(async(req,res,next)=>{
    
    res.status(200).json({
        success:true,
        key:process.env.RAZORPAY_KEY_API,
    })
})

export const cancelSubscription=Cae(async(req,res,next)=>{

    const user=await User.findById(req.user._id);

    const subscriptionId=user.subscription.id;

    let refund=false;

    await instance.subscriptions.cancel(subscriptionId);

    const payment=await Payment.findOne(
        {
            razorpay_subscription_id:subscriptionId,
        }
    );

    const gap= Date.now()-payment.createdAt;

    const refundTime=process.env.REFUND_DAYS*24*60*60*1000;
    

    if(refundTime>gap){
        await instance.payments.refund(payment.razorpay_payment_id);
    }

    await payment.remove();

    user.subscription.id=undefined;
    user.subscription.status=undefined;

    await user.save();


    res.status(200).json({
        success:true,
        message:
        refund?"Subscription Cancelled Successfully , You will recieve refund Payment in 7Days"
        :"Subscription Cancelled Successfully ,No refund was Iniated as Subscription cancelled after 7Days"
    })
})