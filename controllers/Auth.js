const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const sendMail=require("../utils/MailSender");
const { create } = require("../models/Category");
const bcrypt = require("bcrypt");
require("dotenv").config();

// send otp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // check if user already exist
    const checkUserPresent = await User.findOne({ email:email });

    // if user exists
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    }

    // generate OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // check in db that otp is unique
    var result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    // create an entry in db for OTP
    const otpBody = await OTP.create(otpPayload);

    // return response successfully
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// signup
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;
    // validate if all the entries have come
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp ||
      !accountType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the Details",
      });
    }
    // check if email already exists
    const user = await User.findOne({ email });
    // console.log(user);
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }
    // check if password and confirmPassword Matches
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // fetch otp from the db
    const recentOtp =await OTP.find({ email }).sort({ CreatedAt: -1 }).limit(1);
      console.log( recentOtp[0].otp);
      console.log( otp);
    // validate otp
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "Error while fetching otp",
      });
    }
     else if (otp!==recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Otp does not match",
      });
    }
    // hashPassword
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // create entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    // console.log("reached here");
    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      accountType,
      password: hashedPassword,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //  console.log("Reached here");
    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
    });
  } catch (error) {
    return res.status(501).json({
      success: false,
      message: "Error in creating user Please try again",
      error
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    // take data from req
    const { email, password } = req.body;
    // validate data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the details",
      });
    }

    // check if user exists using email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Does Not Exists",
      });
    }

    // match passwords
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      //TODO: read more about jwt
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      // create cookie and send response
      const options = {
        expires: new Date(Date.now + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      return res.cookie("token", token, options).status(200).json({
        success: true,
        user,
        token,
        message: "User Logged in Successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Password Incorrect",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "error while logging",
    });
  }
};

// changePassword
exports.changePassword = async (req, res) => {
  try {
    // take data
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const { email } = req.user;
    // validate data
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill All Entries",
      });
    }

    // check for oldPassword in Db
    const user = User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exists",
      });
    }
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Old Password is incorrect",
      });
    }

    // compare newPassword and confirmNewPassword
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    // update Password in db
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.save();
    // send mail - Password Updated
    try {
      const mailResponse = await sendMail(
        email,
        "Notification-Password Update",
        "Password Updated Successfully"
      );
      console.log(mailResponse);
    } catch (error) {
      console.log("An error was detected while sending the mail", error);
      return res.status(400).json({
        success:false,
        message:"Error while sending mail",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while changing Password Please try again",
    });
  }
};
