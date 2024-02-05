const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const {
    deleteUser,
  updateProfile,
  getUserDetails,
  updateProfilePicture,
  getEnrolledCourses,
} = require("../controllers/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, deleteUser)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateProfilePicture)

module.exports = router