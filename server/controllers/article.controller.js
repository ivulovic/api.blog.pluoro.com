const ArticleModel = require("../models/article.model");
const { Unauthorized } = require("../helpers/response.helper");
module.exports = {
  create: async (req, res) => {
    const content = req.value.body;
    content.createdAt = Date.now();
    content.createdBy = req.decoded.user;
    const objToSave = new ArticleModel(content);
    await objToSave.save();
    res.status(200).send(objToSave);
  },
  list: async (req, res) => {
    const arr = await ArticleModel.find().populate("page");
    res.status(200).send(arr);
  },
  listAll: async (req, res) => {
    const arr = await ArticleModel.find();
    res.status(200).send(arr);
  },
  remove: async (req, res) => {

    const { id } = req.value.params;

    const obj = await ArticleModel.findOne({ createdBy: req.decoded.user, _id: id });
    if (!obj) {
      obj.send(403).send(Unauthorized);
      return;
    }

    await ArticleModel.findByIdAndRemove(id);

    res.status(200).send({ _id: id });
  },
  update: async (req, res) => {
    const { id } = req.value.params;
    const content = req.value.body;
    const objToSave = await ArticleModel.findByIdAndUpdate(id, content);
    res.status(200).send({ ...objToSave._doc, ...content });
  },
  listPageArticles: async (req, res) => {
    const arr = await ArticleModel.find({ createdBy: req.decoded.user, page: req.value.params.id });
    res.status(200).send(arr);
  },
};
