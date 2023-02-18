import express from "express";
import { contact, courseRequest, getDashboard } from "../controllers/otherControllers.js";

import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";


const router=express.Router();

//contact Form 

router.route("/contact").post(contact);

//request


router.route("/courserequest").post(courseRequest);

//get Admin Dashboard

router.route("/admin/stats").get(isAuthenticated,authorizeAdmin,getDashboard);



export default router;

