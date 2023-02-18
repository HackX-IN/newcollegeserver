import { Cae } from "../middlewares/Cae.js"
import {Course} from "../models/Course.js"
import getDatauri from "../utils/datauri.js";

import cloudinary from 'cloudinary';
import ErrorHandler from "../utils/ErrorHandler.js";
import { Stats } from "../models/DashboardStat.js";
export const getAllCourses=Cae(
    async(req,res,next)=>{

        const keyword=req.query.keyword||"";
        const category=req.query.category||"";
   
        const courses= await Course.find({
            title:{
                $regex:keyword,
                $options:"i",
            },
            category:{
                $regex:category,
                $options:"i",
            },
        }).select("-lectures");
    
        res.status(200).json({
            success:true,
            courses,
        });
        
    }
)

export const createCourse=Cae(
    async(req,res,next)=>{
        
   
       const{title,description,category,createdBy}= req.body;

       if(!title || !description||!category||!createdBy) return next(new ErrorHandler("Please Add Fields",400));

       const file=req.file

       const fileUri=getDatauri(file)

       const myCloud=await cloudinary.v2.uploader.upload(fileUri.content)

   

       await Course.create({
        title,description,category,createdBy,
        poster:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        }
       })
        res.status(201).json({
            success:true,
            message:`${title} added successfully  , You can Add Lectures Now`
        });
        
    }
)


export const getLectures=Cae(
    async(req,res,next)=>{

        const course=await Course.findById(req.params.id);
        if(!course) return next(new ErrorHandler("Course Not Found",404))

        course.views+=1;

        await course.save()

        res.status(200).json({
            success:true,
            lectures:course.lectures,
        })
        

    }
)


export const addLectures=Cae(
    async(req,res,next)=>{
        
        const {id}=req.params;

        const {title,description}=req.body

        const course=await Course.findById(id);
        if(!course) return next(new ErrorHandler("Course Not Found",404))

        const file=req.file

        const fileUri=getDatauri(file)
 
        const myCloud=await cloudinary.v2.uploader.upload(fileUri.content,{
            resource_type:"video",
        })

        course.lectures.push({
            title,
            description,
            video:{
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            }
        })

        course.numOfVideos=course.lectures.length

        await course.save();

       

        res.status(200).json({
            success:true,
            message:`${title} Added Successfully!`
        })
        

    }
)

export const deleteCourse=Cae(
    async(req,res,next)=>{


        const {id}=req.params;

        const course=await Course.findById(id);
        if(!course) return next(new ErrorHandler("Course Not Found",404))

        await cloudinary.v2.uploader.destroy(course.poster.public_id
       )

        for (let i = 0; i < course.lectures.length; i++) {
            const singleLectures = course.lectures[i];

            await cloudinary.v2.uploader.destroy(singleLectures.public_id,{
                resource_type:"video",
            })
            
        } 

       await course.remove()

        res.status(200).json({
            success:true,
            message:"Courses Deleted Successfully",
        })
        

    }
)

export const deleteLec=Cae(
    async(req,res,next)=>{
        
    

        const {courseId,lectureId}=req.query;

        const course=await Course.findById(courseId);
        if(!course) return next(new ErrorHandler("Course Not Found",404))

        const lecture=course.lectures.find((item)=>{
            if(item._id.toString()===lectureId.toString()) return item;       
        
        })

        await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
            resource_type:"video",
        })

       course.lectures=course.lectures.filter((item)=>{
            if(item._id.toString()!==lectureId.toString()) return item;       
        
        })

        course.numOfVideos=course.lectures.length

        await course.save();


        res.status(200).json({
            success:true,
            message:"Lectures Deleted Successfully",
        })
        

    }
)
Course.watch().on("change",async()=>{
    const stats= await Stats.find({}).sort({createdAt:"desc"}).limit(1);

    const courses=await Course.find({});

   let totalViews=0;

    for (let i = 0; i < courses.length; i++) {
      totalViews+=courses[i].views;
        
    }

    stats[0].views=totalViews;

    stats[0].createdAt=new Date(Date.now());

    await stats[0].save();

    
})

