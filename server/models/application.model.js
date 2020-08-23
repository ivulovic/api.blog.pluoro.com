const { Schema, model } = require("mongoose");

const ApplicationSchema = new Schema({
  name: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "account"
  },
  createdAt: Number
});

module.exports = model("application", ApplicationSchema);
