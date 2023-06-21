const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  firstname: {
    type: String,
    min: 3,
    max: 20,
    default: "firstname",
    required: true
  },
  lastname: {
    type: String,
    min: 2,
    max: 20,
    required: true
  },
  middlename: {
    type: String,
    min: 2,
    max: 20,
    required: true
  },
  avatar: {
    type: String,
    default: "https://res.cloudinary.com/lcu-feeding-backup/image/upload/v1686694447/utils/man_lzm3t8.png"
  },
  faculty: {
    type: String,
    index: true,
    required: true
  },
  department: {
    type: String,
    index: true,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  matricNumber: {
    type: String,
    index: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  sex: {
    type: String,
    emun: ["Male", "Female"]
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "room",
    default: null
  }
});

UserSchema.plugin(mongoosePaginate);

UserSchema.pre("save", function (next) {
  this.percentage = (this.amountPaid / this.amount) * 100;
  next();
});

UserSchema.pre(/^find/, function (next) {
  this.populate({
    path: "room",
    populate: {
      path: "hostel",
    }
  });
  next();
});

UserSchema.query.excludeFields = function (fields) {
  const projection = fields.reduce((proj, field) => {
    proj[field] = 0; // Exclude the specified field
    return proj;
  }, {});

  return this.select(projection);
};

module.exports =  mongoose.model("user", UserSchema);
