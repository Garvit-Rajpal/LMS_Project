const express = require("express");
const router = express.Router();
// course controllers
const { createCourse, getAllCourses, getCourseDetails } = require("../controllers/Course");
// import category controllers
const {createCategory,showAllCategories,categoryPageDetails}=require("../controllers/Category");
// import rating controllers
const {createRatingAndReview,updateRatingAndReview,getAvgRating,getAllRating}=require("../controllers/RatingAndReview");
// import section controllers
const {createSection,deleteSection,updateSection}=require("../controllers/Section");

// import subsection controllers
const {createSubSection,updateSubSection,deleteSubSection}=require("../controllers/SubSection");

// import middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");

// create routes for post
router.post("/createCourse",auth,isInstructor,createCourse);
router.post("/createCategory",auth,isAdmin,createCategory);
router.post("/createRatingAndReview",auth,isStudent,createRatingAndReview);
router.post("/createSection",auth,isInstructor,createSection);
router.post("/createSubSection",auth,isInstructor,createSubSection);

// create routes for put
router.put("/updateRatingAndReview",auth,isStudent,updateRatingAndReview);
router.put("/deleteSection",auth,isInstructor,deleteSection);
router.put("/updateSection",auth,isInstructor,updateSection);
router.put("/updateSubSection",auth,isInstructor,updateSubSection);
router.put("/deleteSubSection",auth,isInstructor,deleteSubSection);

// create routes for get
router.get("/getAllCourses",getAllCourses);
router.get("/getCourseDetails",getCourseDetails);
router.get("/showAllCategories",showAllCategories);
router.get("/categoryPageDetails",categoryPageDetails);
router.get("/getAvgRating",getAvgRating);
router.get("/getAllRating",getAllRating);

module.exports=router;





