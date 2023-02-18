import {createTransport} from 'nodemailer'

export const sendEmail=async(to,subject,text)=>{

    const transporter=createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "1b3ba2e8057cea",
          pass: "8044973e7b1c9a"
        }
      });

    await transporter.sendMail({
        to,subject,text
    })
}