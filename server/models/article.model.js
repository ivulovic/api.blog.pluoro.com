const { Schema, model } = require("mongoose");

const ArticleSchema = new Schema({
  path: String,
  title: String,
  description: String,
  content: String,
  public: Boolean,
  page: {
    type: Schema.Types.ObjectId,
    ref: "page"
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "account"
  },
  createdAt: Number
});

module.exports = model("article", ArticleSchema);
