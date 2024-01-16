const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGOOSE_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true

    }).then(()=>console.log("DB connected successfully"))
    .catch((error)=>{
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    })
}