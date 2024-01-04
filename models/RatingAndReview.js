const mongoose = require("mongoose");

const ratingAndReview=new mongoose.Schema({
    user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ,
    review:{
        type:String,
        trim:true,
    },
    rating:{
        type:Number,
        trim:true,
    },
    course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},
});

module.exports=mongoose.model("RatingAndReview",ratingAndReview);