import express from "express";
import { buySubscription, cancelSubscription, getRazorPAy, paymentVerifi } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";


const router=express.Router();

//Buy Subscription

router.route("/subscribe").get(isAuthenticated,buySubscription)
//razorpaykey
router.route("/razorpaykey").get(getRazorPAy)
//payment
router.route("/paymentverification").post(isAuthenticated,paymentVerifi)
//cancelsubs
router.route("/subscribe/cancel").delete(isAuthenticated,cancelSubscription)


export default router;

