import express from 'express';
import cookieParser from 'cookie-parser'
import cors from 'cors';

import { config } from 'dotenv';
import payment from './routes/PaymentRoutes.js';
import course from './routes/CourseRoute.js';
import user from './routes/UserRoute.js';
import ErrorMiddleware from './middlewares/Error.js'
import other from './routes/OtherRoutes.js'

config({
    path:"./config/config.env",
})

const app=express()

//usig Middleware

app.use(express.json())
app.use(express.urlencoded({
    extended:true,
}))

app.use(cookieParser())

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}))


//using Routes For Implement
app.use("/api/v1",course);
app.use("/api/v1",user);
app.use("/api/v1",payment);
app.use("/api/v1",other);

app.get("/",(req,res)=>{
    res.send(`<div>Welcome TO NCC COURSE </div
    `)
})



export default app;


app.use(ErrorMiddleware)
