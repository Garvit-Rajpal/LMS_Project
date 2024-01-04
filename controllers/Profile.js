const User = require("../models/User");
const Profile = require("../models/Profile");
require("dotenv").config();
const { imageUploader } = require("../utils/imageUploader");

//update profile
exports.updateProfile = async (req, res) => {
  try {
    // fetch all data
    const { gender = "", dateOfBirth = "", about, contactNumber } = req.body;
    const id = req.user.id;

    const userDetails = await User.findById(id);
    const profileDetails = await Profile.findById(
      userDetails.additionalDetails
    );

    profileDetails.gender = gender;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;

    // saving details
    await profileDetails.save();
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      data: profileDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in updating profile",
    });
  }
};

// get all user details
exports.getUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    return res.status(200).json({
      success: true,
      message: "Following are the user details",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching user details",
    });
  }
};

// delete user Account
exports.deleteUser = async (req, res) => {
  try {
    // TOdo:scheduling of the function
    const id = req.user.id;
    // get user and profile
    const user = await User.findById({ id });
    const profile = await Profile.findByIdAndDelete(user.additionalDetails);
    // also unenroll user from all courses think about this will the id not get deleted itself?

    const userDelete = await User.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "User Deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting account",
    });
  }
};
// update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    // fetch picutre
    const id = req.user.id;
    const image = req.files.image;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image required before uploading",
      });
    }
    // upload to cloudinary
    const imageUpload = await imageUploader(
      image,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    // find user and update
    const userDetails = await User.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          image: imageUpload.secure_url,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: false,
      message: "User Image updated successfully",
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in updating profile picture",
    });
  }
};

// get enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    // fetch id
    const id = req.user.id;
    const user = await User.findById({ _id: id }).populate("courses").exec();
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      messsage: "These are the enrolled courses",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching enrolled courses details",
    });
  }
};
