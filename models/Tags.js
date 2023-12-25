const mongoose = require("mongoose");

const tags = new mongoose.Schema({
  name: {
    type: String,
  },
  Description: {
    type: String,
    trim: true,
  },
  courses:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }
  ]
});

module.exports = mongoose.model("Tags", tags);