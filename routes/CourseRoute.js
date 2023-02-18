import express from "express";
import { addLectures, createCourse, deleteCourse, deleteLec, getAllCourses, getLectures } from "../controllers/courseController.js";
import { authorizeAdmin,  authorizeSubscibe, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from '../middlewares/Multer.js'
const router=express.Router();


// Get All Courses Without Lectures
router.route('/courses').get(getAllCourses)

// Create new courses Admin
router.route('/createcourse').post(isAuthenticated,authorizeAdmin,singleUpload,createCourse)

//Add lectures,Delete Courses,Get all courses Details
router.route('/course/:id').get(isAuthenticated,authorizeSubscibe,getLectures).post(isAuthenticated,authorizeAdmin,singleUpload,addLectures).delete(isAuthenticated,authorizeAdmin,deleteCourse)

//Delete Lectures

router.route('/lecture').delete(isAuthenticated,authorizeAdmin,deleteLec)


export default router;

