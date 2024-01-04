const Rating = require("../models/RatingAndReview");
const User = require("../models/User");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create Rating
exports.createRatingAndReview = async (req, res) => {
  try {
    // fetch course and user id
    const id = req.user.id;
    const { courseId, rating = "", review = "" } = req.body;
    // validate user details
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: id } },
    });

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "User is not enrolled in the course",
      });
    }
    // check if already reviewed
    const alreadyReviewed = await Rating.findOne({
      user: id,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        messsage: "Cannot review mutliple times",
      });
    }
    // add review
    const ratingAndReview = await Rating.create({
      user: id,
      course: courseId,
      rating,
      review,
    });
    // add reviw to course
    await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReview: ratingAndReview._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Rating and review added successfully",
      data: ratingAndReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while adding review",
    });
  }
};

// update rating
exports.updateRatingAndReview = async (req, res) => {
  try {
    // get user id
    const id = req.user.id;
    const { ratingID, review, rating } = req.body;
    const findUser = await Rating.findOne({
      user: id,
      _id: ratingID,
    });
    if (!findUser) {
      return res.status(400).json({
        success: false,
        message: "Can only update rating with your id",
      });
    }
    findUser.rating = rating;
    findUser.reviw = review;
    findUser.save();
    return res.status(200).json({
      success: true,
      message: "Successfully updated the review ",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating the rating",
    });
  }
};

// get avg Rating
exports.getAvgRating = async (req, res) => {
  try {
    // get course id
    const courseId = req.body.courseId;
    // create an aggreation pipeline to find the avg rating for the course
    const avgRating = await Rating.aggregate([
      {
        $match: new mongoose.Types.ObjectId(courseId),
      },
      {
        $group: {
          // id is passed null to group all the entities into one element
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      }
    ]);
    if (avgRating.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully",
        data: avgRating[0].averageRating,
      });
    }
    //if no rating/Review exist
    return res.status(200).json({
      success: true,
      message: "Average Rating is 0, no ratings given till now",
      averageRating: 0,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching Average Rating",
    });
  }
};

// get all Rating
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await Rating.find({})
      .sort({ desc })
      .populate({
        path: "user",
        select: "firstName,lastName,email",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while geting all rating",
    });
  }
};
