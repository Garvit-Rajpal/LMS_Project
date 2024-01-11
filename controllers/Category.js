const { mongo } = require("mongoose");
const Category = require("../models/Category");
const Course=require("../models/Course");

// create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Required Fields",
      });
    }
    const category = await Category.create({
      name,
      description,
    });
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Error while creating category",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating Category",
    });
  }
};

// show all categories
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching the categories",
    });
  }
};

// show category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    // fetch categoryId
    const { categoryId } = req.body;

    //find the category courses
    const categoryDetails = await Category.findById({ _id: categoryId })
      .populate("courses")
      .exec();

    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message:
          "Category details not found please request with correct Category",
      });
    }
    // showing different category
    const differentCategory = await Category.find({ _id: { $ne: categoryId } })
      .populate("courses")
      .exec();

    // find top 10 selling courses
    const topSellingCourses=await Course.aggregate(
        [
            {
                $match:{
                Category:new mongoose.Types.ObjectId(categoryId),
            }},
            {
                $addFeild:{
                    noOfStudents:{
                        $size:{$ifNull:["$studentsEnrolled",""]},
                    }

                }
            },
            // {
            //     $group:{
            //         _id:'$_id',
            //         name:{$first:'$courseName'},
            //         studentsEnrolled:{$sum:1},
            //     }
            // },
        //     {$group:{
        //         _id:'$_id',
        //         numStudents: { $sum: '$studentsEnrolled'},
             
        //     }
        // },
        { $sort: { noOfStudents: -1 } },
        { $limit: 10 }

        ]
    )

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching categories to show",
    });
  }
};
