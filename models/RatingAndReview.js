const mongoose = require("mongoose");

const ratingAndReview=new mongoose.Schema({
    user:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ],
    review:{
        type:String,
        trim:true,
    },
    rating:{
        type:Number,
        trim:true,
    }
});

module.exports=mongoose.model("RatingAndReview",ratingAndReview);