const { Mongoose, default: mongoose } = require("mongoose");
const {instance} =require("../config/razorpay")
const Course=require("../models/Course");
const User=require("../models/User");

// create and instantiate order
exports.createOrder=async(req,res)=>{
    
    const {userId,courseId}=req.body;
    if(!courseId){
        return res.status(400).json({
            success:false,
            message:"Valid Course Id required",
        })
    }
    let course;
    try{
        course=await Course.findById({_id:courseId});
        if(!course){
            return res.status(400).json({
                success:false,
                message:"Course not found",
            })
        }
        // check if student is already enrolled in the course
        const uid=new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
                message:"Student is already enrolled",
            })
        }


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error while Validating Course Order",
        })
    }
    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: course_id,
            userId,
        }
    };
    try{
        const paymentResponse=await instance.orders.create(options);
        return res.status(200).json({
            success:true,
            message:"Order Created successfully",
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error while Creating Order",
        })

    }
}

// verify Signature of Razorpay
exports.verifySignature=async(req,res)=>{
    // verify the signature using crypto hmac function since will get a 
    // encrypted signature in res
    const webHookSecret="12345679";
    const signature=req.headers["x-razorpay-signature"];
    const shasum=crypto.createHmac("sha256",webHookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");

    if(signature===digest){
        console.log("Payment is authorized");
        const {userId,courseId}=req.body.payload.payment.entity.notes;
        try{
            // enroll student in course
            const course=await Course.findByIdAndUpdate(
                {_id:courseId},
                {
                    $push:{
                        studentsEnrolled:userId
                    }
                },
                {new:true},
            );
            if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Course not found",
                })
            }

            // add course in user schema
            const user=await User.findByIdAndUpdate(
                {_id:userId},
                {
                    $push:{
                        courses:courseId
                    }
                },
                {new:true}
            )

            //mail send krdo confirmation wala 
                const emailResponse = await mailSender(
                                        user.email,
                                        "Congratulations from CodeHelp",
                                        "Congratulations, you are onboarded into new CodeHelp Course",
                );

                console.log(emailResponse);
                return res.status(200).json({
                    success:true,
                    message:"Signature Verified and COurse Added",
                });


        }       
        catch(error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
        }
        else{
            return res.status(500).json({
                success:false,
                message:"Error while verifying signature"
            })
        }
    }
