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
    type: [{type: mongoose.Schema.Types.ObjectId, ref: "user"}],
    validate: {
      validator: function(arr) {
        return arr.length <= this.maxPerRoom;
      },
      message: function(props) {
        return `Room size exceeds the limit of ${props.value}.`;
      }
    }
  },
  numOfStudents: {
    type: Number,
    default: 0
  },
  roomNum: {
    type: String,
    required: true
  }
}, {timestamps: true});

RoomSchema.plugin(mongoosePaginate);

RoomSchema.pre("save", function(next) {
  this.numOfStudents = this.students.length;
  next();
});

RoomSchema.index({ hostel: 1, roomNum: 1 }, { unique: true });
RoomSchema.index(
  { students: 1 },
  { unique: true, partialFilterExpression: { students: { $exists: true, $ne: [] } } }
);

module.exports =  mongoose.model("room", RoomSchema);