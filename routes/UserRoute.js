import express from "express";
import { addtoPlay, changePassword, deletemyProfile, deleteusers, forgetPassword, GetallUsers, getmyProfile, login, logout, register, removePlaylist, resetPassword, updateProfile,updateProfilepic, updateusers } from "../controllers/userController.js";
import {authorizeAdmin, isAuthenticated} from "../middlewares/auth.js"
import singleUpload from '../middlewares/Multer.js';

const router=express.Router();

//route for register
router.route("/register").post(singleUpload,register);
//route for Login
router.route("/login").post(login);
//logout
router.route("/logout").get(logout);

//profile
router.route("/me").get(isAuthenticated,getmyProfile);

//deleteMyprofile

router.route("/me").delete(isAuthenticated,deletemyProfile);

//change Password
router.route("/changepassword").put(isAuthenticated,changePassword);

//updateProfile
router.route("/updateprofile").put(isAuthenticated,updateProfile);

//pictureUpdate
router.route("/updateprofilepicture").put(isAuthenticated,singleUpload,updateProfilepic);
//forget password
router.route("/forgetpassword").post(forgetPassword);
//reset
router.route("/resetpassword/:token").put(resetPassword);
//addtoplaylist
router.route("/addtoplaylist").post(isAuthenticated,addtoPlay);
//remove
router.route("/removefromplaylist").delete(isAuthenticated,removePlaylist);


//Admin Routes
router.route("/admin/users").get(isAuthenticated,authorizeAdmin,GetallUsers);

router.route("/admin/users/:id").put(isAuthenticated,authorizeAdmin,updateusers).delete(isAuthenticated,authorizeAdmin,deleteusers)









export default router;

