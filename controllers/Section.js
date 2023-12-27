const Section =require("../models/Section");
const Course=require("../models/Course");
const { populate, findByIdAndDelete, findByIdAndUpdate } = require("../models/Otp");
const { findById } = require("../models/Profile");

exports.createSection=async(req,res)=>{
    try{
        // fetch data
        const{sectionName,courseId}=req.body;
        const {userId}=req.user.id;

        // validate user
        if(!userId){
            return res.status(401).json({
                success:false,
                message:"User not found",
            })
        }
        if(!sectionName || !courseId){
            return res.status(401).json({
                success:false,
                message:"All fields are required",
            })
        }
        const sectionDetails=await Section.create(sectionName);

        const courseDetails=await Course.findByIdAndUpdate(
            {courseId},
            {
                $push:{courseContent:sectionDetails._id},
            },
            {new:true},
            ).populate({
                path: "courseContent",
                populate:{
                    path: "subSection"
                }
            }).exec();

        return res.status(200).json({
            success:true,
            message:"Section Created successfully",
            data:courseDetails,
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Error while creating section"
        })
    }
}

// delete section
exports.deleteSection=async(req,res)=>{
    try{
        // fetch Data
        const {sectionId}=req.body;
        // validate Data
        if(!sectionId){
            return res.status(404).json({
                success:false,
                message:"section Id not received"
            })
        }
        const deleteSection=await findByIdAndDelete({sectionId});

        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully"
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Section could not be deleted"
        })

    }
}

// update section 
exports.updateSection=async(req,res)=>{
    try{
        // fetch Data
        const {sectionId,sectionName}=req.body;
        // validate Data
        if(!sectionId){
            return res.status(404).json({
                success:false,
                message:"section Id not received"
            })
        }
        const updateSection=await findByIdAndUpdate({sectionId},{sectionName:sectionName},{new:true});

        return res.status(200).json({
            success:true,
            message:"Section updated Successfully"
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Section could not be updated"
        })

    }
}
