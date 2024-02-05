const User = require("../models/User");
const jwt = require("jsonwebtoken");

// authenticating the user
exports.auth = async (req, res,next) => {
  try {
    // extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");
    
    // validate token 
    if(!token){
        return res.status(400).json({
            success:false,
            message:"Error in retreiving token",
        })
    }
    try{
        const decode=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decode;
    }
    catch(error){
        return res.status(403).json({
            success:false,
            message:"Token is not valid",
        })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in authenticating user",
    });
  }
  next();
};

// isStudent
exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(403).json({
                success:false,
                message:"This is a protected route for Students",
            })
        }
        next();

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message: "Error while validating student path",
        })
    }

}

// isInstructor
exports.isInstructor= async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Instructor"){
            return res.status(403).json({
                success:false,
                message:"This is a protected route for instructor",
            });
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error while validating instructor path"
        })
    }
}

// admin
exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(403).json({
                success:false,
                message:"This is a protected route for admin",
            })
        }

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error in validating Admin path",
        })
    }
}
