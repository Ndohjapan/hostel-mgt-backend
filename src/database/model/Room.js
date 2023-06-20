const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const RoomSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hostel",
    required: true
  },
  maxPerRoom: {
    type: Number,
    required: true
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  roomNum: {
    type: String,
    required: true
  }
}, {timestamps: true});

RoomSchema.plugin(mongoosePaginate);

RoomSchema.index({ hostel: 1, roomNum: 1 }, { unique: true });
module.exports =  mongoose.model("room", RoomSchema);