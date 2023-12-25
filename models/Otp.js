const mongoose = require("mongoose");
const sendMail = require("../utils/MailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires:5*60
  },
  otp: {
    type: Number,
  },
});

// function to call to the senMail function
async function sendVerificaionMail(email,otp){
    try{
        const mailResponse = await sendMail(email,"This is a verification mail for account creation",otp);
        console.log(mailResponse);

    }
    catch(error){
        console.log("An error was detected while sending the mail",error);
        throw error;
    }
} 

// pre middleware hook to call the email otp verification before saving entry for user
OTPSchema.pre("save",async function(next){
    try{

        await sendVerificaionMail(this.email,this.otp);
        next();
    }
    catch(error){
        console.log("An error while calling the email sending function",error);
    }
})

module.exports = mongoose.model("OTP", OTPSchema);
