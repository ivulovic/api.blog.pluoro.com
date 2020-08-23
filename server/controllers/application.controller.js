const ApplicationModel = require("../models/application.model");
const ArticleModel = require("../models/article.model");
const PageModel = require("../models/page.model");
const { Unauthorized } = require("../helpers/response.helper");

module.exports = {
  create: async (req, res) => {
    const content = req.value.body;
    content.createdAt = Date.now();
    content.createdBy = req.decoded.user;
    const objToSave = new ApplicationModel(content);
    await objToSave.save();
    res.status(200).send(objToSave);
  },
  list: async (req, res) => {
    const applications = await ApplicationModel.find({ createdBy: req.decoded.user }).sort("-createdAt");
    res.status(200).send(applications);
  },
  remove: async (req, res) => {
    const { id } = req.value.params;

    const app = await ApplicationModel.findOne({ createdBy: req.decoded.user, _id: id });
    if (!app) {
      res.send(403).send(Unauthorized);
      return;
    }

    const pagesArr = await PageModel.find({ application: id });

    for (let i = 0; i < pagesArr.length; i++) {
      // Remove articles
      let articlesArr = await ArticleModel.find({ page: pagesArr[i]._id });
      for (let j = 0; j < articlesArr.length; j++) {
        await ArticleModel.findByIdAndRemove(articlesArr[j]._id);
      }
      // Remove page
      await PageModel.findByIdAndRemove(pagesArr[i]._id);
    }

    let objToSave = await ApplicationModel.findByIdAndRemove(id);
    res.status(200).send(objToSave);
  },
  update: async (req, res) => {
    const { id } = req.value.params;
    const content = req.value.body;
    const objToSave = await ApplicationModel.findByIdAndUpdate(id, content);
    if (content.name) objToSave.name = content.name;
    res.status(200).send(objToSave);
  }
};
