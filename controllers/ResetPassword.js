const User=require("../models/User");
const mailSender=require("../utils/MailSender");
const bcrypt=require("bcrypt");

// generate token and link for password reset
exports.resetPasswordToken=async(req,res)=>{
    try{
        // fetch data
        const {email}=req.body;
        // validate user
        const userDetails=await User.findOne({email:email});
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            })
        }
        // generate random token
        const token=crypto.randomUUID();
        // update user Schma with token 

        const userUpdate=await User.findOneAndUpdate(
            {email:email},
            {
                $push:{
                    token:token,
                    expiresIn:Date.now()+5*60*1000,
                }
            },
            {new:true},
        )
        // construct url
        const url=`http://localhost:3000/update-password/${token}`
        // send email 
        const emailMessage=await mailSender(email,"This is the link to Change Your Password",
        `Password Reset Link: ${url}`);

        return res.status(200).json({
            success:true, 
            message:"Password Reset Link Sent successfully",
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in generating link please try again"
        })
    }
}

// reset Password
exports.resetPassword=async(req,res)=>{
    try{
        // fetch Data
        const {newPassword,confirmNewPassword,token}=req.body;
        // validate data
        if(!newPassword||!confirmNewPassword||!token){
            return res.status(404).json({
                success:false,
                message:"All fields Required",
            });
        }
        // compare Password
        if(newPassword!==confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:"Passwords do not match",
            })
        }
        const userDetails=await User.findOne({token:token});
        //if no entry - invalid token
        if(!userDetails) {
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }
        // validate token
        if(userDetails.expiresIn <Date.now()){
            return res.status(400).json({
                success:false,
                message:"Token expired please generate new link",
            })
        }
        const hashedPassword=bcrypt.hash(newPassword,10);

        const userUpdate=await User.findByIdAndUpdate(
            {_id:userDetails._id},
            {
                $push:{
                    password:hashedPassword,
                }
            },
            {new:true},
            );
        
        return res.status(200).json({
            success:true,
            message:"Password Updated Successfully",
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Reset Password Failed",
        })
    }
}