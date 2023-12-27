const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
  },
  courseDescription: {
    type: String,
  },
  instrtuctor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReview: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbNail: {
    type: String,
  },
  tags:{
    type: [String],
    required:true,
  },
  Category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tags",
    },
  ],
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
