const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { imageUploader } = require("../utils/imageUploader");

// create subsection
exports.createSubsection = async (req, res) => {
  try {
    // fetch data
    const { title, description, sectionId } = req.body;
    const { video } = req.files.video;
    // validate data
    if (!title || !description) {
      return res.status(404).json({
        success: false,
        message: "All Fields Are Required",
      });
    }
    if (!sectionId) {
      return res.status(404).json({
        success: false,
        message: "Cannot create subsection without a section",
      });
    }
    // upload to cloudinary
    const uploadVideo = await imageUploader(video, process.env.FOLDER_NAME);
    // create entry in db
    const subSectionDetails = SubSection.create({
      title,
      timeDuration: `${uploadVideo.duration}`,
      description,
      videoUrl: uploadVideo.secure_url,
    });
    // update section with subsection id
    const sectionUpdate = Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");
    // return response
    return res.status(200).json({
      success: true,
      message: "Subsection created Successfully",
      data: subSectionDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in Creating Subsection",
    });
  }
};

// update subsection
exports.updateSubSection = async (req, res) => {
  try {
    // fetch data
    const { title, description, subSectionId } = req.body;
    const { video } = req.files.video;
    if (!subSectionId) {
      return res.status(404).json({
        success: false,
        message: "Subsection id not found",
      });
    }
    const subSectionDetails = await SubSection.findById({ subSectionId });
    if (!subSectionDetails) {
      return res.status(404).json({
        success: false,
        message: "Subsection details not found",
      });
    }

    // validate data
    if (title) {
      subSectionDetails.title = title;
    }
    if (description) {
      subSectionDetails.description = description;
    }
    if (video) {
      // upload video to cloudinary
      const uploadVideo = await imageUploader(video, process.env.FOLDER_NAME);
      // update subsection
      subSectionDetails.timeDuration = `${uploadVideo.duration}`;
      subSectionDetails.videoUrl = uploadVideo.secure_url;
    }
    subSectionDetails.save();
    // return response
    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully",
    });
  } catch (error) {
    return res.stats(500).json({
      success: false,
      message: "Error in updating Section",
    });
  }
};

// delete subsection
exports.deleteSubSection = async (req, res) => {
  try {
    // fetch data
    const { subSectionId, sectionId } = req.body;
    const sectionUpdate = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: { subSection: subSectionId },
      }
    );
    const subSectionDelete = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });
    if (!subSectionDelete) {
      return res.status(400).json({
        success: false,
        message: "Error while deleting subsection",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while Deleting subsection",
    });
  }
};
