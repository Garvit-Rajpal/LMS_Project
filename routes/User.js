// Import the required modules
const express=require(express);
const router=express.Router();


// importing the controllers
const {sendOTP,login,signup,changePassword}=require("../controllers/Auth");

const {resetPasswordToken,resetPassword}=require("../controllers/ResetPassword");

const {auth}=require("../middlewares/auth");

// routing
router.post("/sendotp",sendOTP);
router.post("/signup",signup);
router.post("/login",login);
router.post("/changePassword",auth,changePassword);
router.post("/reset-pass-token",resetPasswordToken);
router.post("/resetpassword",resetPassword);

module.exports=router;
