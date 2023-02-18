import { Cae } from "../middlewares/Cae.js"
import {User} from "../models/User.js"
import {Course} from "../models/Course.js"
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendEmail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from 'crypto';
import cloudinary from 'cloudinary'
import getDatauri from "../utils/datauri.js"
import { Stats } from "../models/DashboardStat.js";

export const register=Cae(
    async(req,res,next)=>{

        const{name,email,password}=req.body;
        const file=req.file

        if(!name||!email||!password||!file) return next(new ErrorHandler("Please Enter All Fields",400));

        let user=await User.findOne({email});

        if(user) return next(new ErrorHandler("User Already Exist",409));

        // Upload File in Cloudnary



        const fileUri=getDatauri(file)
 
        const myCloud=await cloudinary.v2.uploader.upload(fileUri.content)


        user =await User.create({
            name,
            email,
            password,
            avatar:{
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            },
        });

        sendToken(res,user,"Registered Successfully",201)
   

    });

    
export const login=Cae(
    async(req,res,next)=>{

        const{email,password}=req.body;

        if(!email||!password) return next(new ErrorHandler("Please Enter All Fields",400));

        const user=await User.findOne({email}).select("+password");

        if(!user) return next(new ErrorHandler("Incorrect Email Or Password",401));

        const isMatch= await user.comparePassword(password);

        if(!isMatch) return next(new ErrorHandler("Incorrect Email Or Password",401));




       

        sendToken(res,user,`Welcome Back ,${user.name}`,201)
   

    });

    export const logout=Cae(
        async(req,res,next)=>{

           await res.status(200).cookie("token",null,{


                expires:new Date(Date.now()),
                httpOnly:true,
                secure:true,
                sameSite:"none",
            }).json({
                success:true,
                message:"Logged Out Successfully"
                        
            })

        })

        export const getmyProfile=Cae(
            async(req,res,next)=>{

                const user=await User.findById(req.user._id);

                res.status(200).json({
                    success:true,
                    user,
                })
            })

            export const changePassword=Cae(
                async(req,res,next)=>{
    
                 const {oldpassword,newpassword}=req.body

                 
                 if(!oldpassword||!newpassword) return next(new ErrorHandler("Please Enter All Fields",400));

                 const user=await User.findById(req.user._id).select("+password")

                 const isMatch= await user.comparePassword(oldpassword);

                 if(!isMatch) return next(new ErrorHandler("Incorrect Old Password",400));

                 user.password=newpassword;

                 await user.save();
    
                    res.status(200).json({
                        success:true,
                        message:"Password Changed Successfully",
                    })
                });

                
            export const updateProfile=Cae(
                async(req,res,next)=>{
    
                 const {name,email}=req.body

                 const user=await User.findById(req.user._id)

                 if(name) user.name=name;
                 if(email)user.email=email;

                
                 await user.save();
    
                    res.status(200).json({
                        success:true,
                        message:"Profile Updated Successfully",
                    })
                })
        
              export const updateProfilepic=Cae(async(req,res,next)=>{

                const user=await User.findById(req.user._id)



                const file=req.file

                const fileUri=getDatauri(file)
         
                const myCloud=await cloudinary.v2.uploader.upload(fileUri.content)

                await cloudinary.v2.uploader.destroy(user.avatar.public_id)

                user.avatar={
                    public_id:myCloud.public_id,
                    url:myCloud.secure_url,
                }

                await user.save()
                    res.status(200).json({
                        success:true,
                        message:"Picture Uploaded Successfully",
                    })

                })

                export const forgetPassword=Cae(async(req,res,next)=>{

                    const {email}=req.body;
                    const user=await User.findOne({email})

                    if(!user) return next(new ErrorHandler("User Not Found",400))

                    const resetToken= await user.getResetToken();

                    await user.save();

                    const url=`${process.env.FRONTEND_URL}/reset password Token/${resetToken}`;

                    const message=`click on link to reset your Password.${url}.If You Have Not requested then Contact Us`

                   await sendEmail(user.email,"NCC reset Password Has Been Send",message)



                    
                        res.status(200).json({
                            success:true,
                            message:`Reset Token Has been Sent to ${user.email}`,
                        })
    
                    })

                    export const addtoPlay=Cae(async(req,res,next)=>{

                       const user= await User.findById(req.user._id)

                       const course = await Course.findById(req.body.id);

                       if(!course) return next(new ErrorHandler("Invalid Course Id",404));

                       const ItemExist=user.playlist.find((item)=>{
                        if(item.course.toString() === course._id.toString()) return true;
                    })

                       if(ItemExist) return next(new ErrorHandler("Item Already exist",409));

                       user.playlist.push({
                        course:course._id,
                        poster:course.poster.url,
                       });

                       await user.save();
                       res.status(200).json({
                        success:true,
                        message:"Added to  Playlist Successfully",
                        
                    });

                        
                    })

                        
                    export const resetPassword=Cae(async(req,res,next)=>{

                        const {token}=req.params;

                        const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")

                        const user=await User.findOne({
                            resetPasswordToken,
                            resetPasswordExpire:{
                                $gt:Date.now()
                            },

                           
                        })
                        if(!user) return next(new ErrorHandler("Token is Invalid ",401))

                        user.password=req.body.password;

                        user.resetPasswordExpire=undefined;
                 
                            res.status(200).json({
                                success:true,
                                message:"Password Changed Successfully",
                                
                            })
        
                        })
        
                        export const removePlaylist=Cae(async(req,res,next)=>{

                            const user= await User.findById(req.user._id)
     
                            const course= await Course.findById(req.query.id);
     
                            if(!course) return next(new ErrorHandler("Invalid Course Id",404));

                            const newPlaylist=user.playlist.filter((item)=>{
                                if(item.course.toString() !== course._id.toString()) return item
                            });

                            user.playlist=newPlaylist;
     
                            
     
                            await user.save();
                            res.status(200).json({
                             success:true,
                             message:"Removed FromPlaylist Successfully",
                             
                         });
     
                             
                         })

                            //Admin Controllers
                        export const GetallUsers=Cae(async(req,res,next)=>{
                            const users=await User.find({})

                            res.status(200).json({
                             success:true,
                             users,
                             
                         });
     
                             
                         })

                         export const updateusers=Cae(async(req,res,next)=>{
                            const user=await User.findById(req.params.id)

                            if(!user) return next(new ErrorHandler("USer Not Found",404))


                            
                            if(user.role==="user") user.role="newian";
                            else user.role="user";
                        

                            await user.save()

                            res.status(200).json({
                             success:true,
                             message:"User Role Updated",
                             
                         });
     
                             
                         })

                         export const deleteusers=Cae(async(req,res,next)=>{
                            const user=await User.findById(req.params.id)

                            if(!user) return next(new ErrorHandler("USer Not Found",404))

                            await cloudinary.v2.uploader.destroy(user.avatar.public_id);

                            //cancel subs


                            
                            await user.remove()

                            res.status(200).json({
                             success:true,
                             message:"User Deleted",
                             
                         });

     
                             
                         })

                         export const deletemyProfile=Cae(async(req,res,next)=>{
                            const user=await User.findById(req.user._id)

                            await cloudinary.v2.uploader.destroy(user.avatar.public_id);

                            //cancel subs


                            
                            await user.remove()

                            res.status(200).cookie("token",null,{
                                expires:new Date(Date.now)
                            }).json({
                             success:true,
                             message:"User  Deleted Successfully",
                             
                         });

                        })

                        User.watch().on("change",async()=>{
                            const stats= await Stats.find({}).sort({createdAt:"desc"}).limit(1);

                            const subscription=await User.find({"subscription.status":"active"});

                            stats[0].users=await User.countDocuments();
                            stats[0].subscription=subscription.length;

                            stats[0].createdAt=new Date(Date.now());

                            await stats[0].save();  


                        })



        
    
            