const Course = require("../models/Course");
const User = require("../models/User");
const Category = require("../models/Category");
const { imageUploader } = require("../utils/imageUploader");
require("dotenv").config();
exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, Category } =
      req.body;
    // fetch file
    const thumbnail = req.files.thumbnailImage;
    // validate data
    if (
      !courseDescription ||
      !courseName ||
      !whatYouWillLearn ||
      !price ||
      !Category ||
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
    // validate Category To check this why Category by id
    const CategoryDetails = await Category.findById(Category);
    if (!CategoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Category details not found ",
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
      Category: CategoryDetails._id,
      thumbNail: imageUpload.secure_url,
    });

    // create Course entry in Category
    const CategoryMap = await Category.findByIdAndUpdate(
      { _id: CategoryDetails._id },
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

// get course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findById({ _id: courseId })
      .populate({
        path: "studentsEnrolled",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate({
        path: "Category",
      })
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Course fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching course details",
    });
  }
};
