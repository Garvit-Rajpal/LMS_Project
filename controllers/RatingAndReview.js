const Rating=require("../models/RatingAndReview");
const User=require("../models/User");
const Course=require("../models/Course");

// create Rating
exports.createRatingAndReview=async(req,res)=>{
    try{
        // fetch course and user id
        const id=req.user.id;
        const {courseId,rating="",review=""}=req.body;
        // validate user details
        const courseDetails=await Course.findOne({
            _id:courseId,
            studentsEnrolled:{$elemMatch:{$eq:id}}
        
        });
        
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"User is not enrolled in the course",
            })
        }
        // check if already reviewed
        const alreadyReviewed=await Rating.findOne({
            user:id,
            course:courseId,
        })

        if(alreadyReviewed){
            return res.status(400).json({
                success:false,
                messsage:"Cannot review mutliple times",
            })
        }
        // add review
        const ratingAndReview=await Rating.create({
            user:id,
            course:courseId,
            rating,
            review,
        });

        return res.status(200).json({
            success:true,
            message:"Rating and review added successfully",
            data:ratingAndReview,
        });


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error while adding review",
        })

    }
}