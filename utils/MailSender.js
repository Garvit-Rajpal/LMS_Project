const nodemailer =require("nodemailer");
require("dotenv");

// function to send the mail
const sendMail=async(email,title,body)=>{
    try{
        let transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        });
        const emailInfo=await transporter.sendMail({
            from:'StudyNotion || LearningBros - by Rajpal',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        })
        console.log(emailInfo);
        return emailInfo;
    }
    catch(error){
        console.log(error.message);
    }
}

module.exports=sendMail;