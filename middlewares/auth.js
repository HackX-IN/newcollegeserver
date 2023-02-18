import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { Cae } from './Cae.js';


export const isAuthenticated=Cae(async(req,res,next)=>{
    const {token}=req.cookies;


    if(!token) return next(new ErrorHandler("Please Login ",401))


    const decoded=jwt.verify(token,process.env.JWT_SECRET);

    req.user=await User.findById(decoded._id);

    next();
})


export const authorizeSubscibe=(req,res,next)=>{

    if(req.user.subscription.status !=="active" && req.user.role !=="admin" && req.user.role !=="newian" )
    return next(new ErrorHandler(`Only Subscribers can access`,403))

    next()

}

export const authorizeAdmin=(req,res,next)=>{   

    if(req.user.role !=="admin")
    return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`,403))

    next()

}


