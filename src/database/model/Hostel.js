const mongoose = require("mongoose");

const HostelSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  maxPerRoom: {
    type: Number,
    required: true
  },
  sex: {
    type: String,
    enum: ["Male", "Female"]
  },
  image: {
    type: String,
    default: "https://res.cloudinary.com/lcu-feeding/image/upload/v1687173495/utils/hostel_slsnba.png"
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  roomRange: {
    type: [String],
    default: ""
  }
}, {timestamps: true});
  
module.exports =  mongoose.model("hostel", HostelSchema);