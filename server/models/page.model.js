const { Schema, model } = require("mongoose");

const PageSchema = new Schema({
  path: String,
  title: String,
  description: String,
  public: Boolean,
  application: {
    type: Schema.Types.ObjectId,
    ref: "application"
  },
  parentPage: {
    type: Schema.Types.ObjectId,
    ref: "page"
  },
  pages: [
    {
      type: Schema.Types.ObjectId,
      ref: "page"
    }
  ],
  articles: [
    {
      type: Schema.Types.ObjectId,
      ref: "article"
    }
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "account"
  },
  createdAt: Number
});

module.exports = model("page", PageSchema);
