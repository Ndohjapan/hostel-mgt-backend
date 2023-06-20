const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");

const PorterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  permissions: {
    type: [String],
    default: ["all"]
  },
  assignedhostel: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  }
}, {timestamps: true});

PorterSchema.plugin(mongoosePaginate);

// Define a query helper to exclude specified fields
PorterSchema.query.excludeFields = function (fields) {
  const projection = fields.reduce((proj, field) => {
    proj[field] = 0; // Exclude the specified field
    return proj;
  }, {});
  
  return this.select(projection);
};
  
PorterSchema.methods.validatePassword  = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("admin", PorterSchema);