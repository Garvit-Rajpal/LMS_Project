const Course = require("../models/Course");
const User = require("../models/User");
const Tag = require("../models/Tags");
const { imageUploader } = require("../utils/imageUploader");
require("dotenv").config();
exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;
    // fetch file
    const thumbnail = req.files.thumbnailImage;
    // validate data
    if (
      !courseDescription ||
      !courseName ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }
    // validate instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor Details not found",
      });
    }
    // validate tag To check this why tag by id
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(400).json({
        success: false,
        message: "Tag details not found ",
      });
    }

    // upload image to cloudinary
    const imageUpload = await imageUploader(thumbnail, process.env.FOLDER);

    // create an entry for new Course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      instrtuctorDetails: instructorDetails._id,
      price,
      tag: tagDetails._id,
      thumbNail: imageUpload.secure_url,
    });

    // create Course entry in Tag
    const tagMap = await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // update User Schema
    const userMap = await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: newCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while Creating Course Please Try Again",
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find({});
    return res.status(200).json({
      success: true,
      message: "All the Courses returned Successfully",
      data: allCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching all the courses",
    });
  }
};
