const ArticleModel = require("../models/article.model");
const PageModel = require("../models/page.model");
const ApplicationModel = require("../models/application.model");
const { Unauthorized } = require("../helpers/response.helper");

module.exports = {
  appStructure: async (req, res) => {

    const app = await ApplicationModel.findOne({ name: req.host });
    if (!app) {
      res.status(403).send(Unauthorized);
      return;
    }

    const excludeId = (obj) => {
      const { _id, ...rest } = obj._doc;
      return rest;
    }

    const excludedArticleOptions = {
      _id: 0,
      __v: 0,
      createdBy: 0,
      page: 0,
      // content: 0,
      public: 0,
    }
    const excludedPageOptions = {
      __v: 0,
      createdBy: 0,
      parentPage: 0,
      application: 0,
      public: 0,
    }

    const applicationId = app._id;
    // Starts from pages that dont have parent ones
    const arr = await PageModel.find({ application: applicationId, parentPage: null, public: true }, excludedPageOptions);

    // Then for each find it's subpages if they exist
    for (let i = 0; i < arr.length; i++) {
      arr[i].pages = await PageModel.find({ application: applicationId, parentPage: arr[i]._id, public: true }, excludedPageOptions);

      // This will get articles basic stuff for every page
      if (arr[i].pages.length) {
        for (let j = 0; j < arr[i].pages.length; j++) {
          // If this ever starts to lag and website goes getting initial data really really slow, then add this
          // { content: 0 }
          // and then call request for getting only content of article by ID you find there in already loaded data.
          arr[i].pages[j].articles = await ArticleModel.find({ page: arr[i].pages[j]._id, public: true }, excludedArticleOptions).sort("-createdAt");
          arr[i].pages[j]._id = null;
          arr[i].pages[j] = excludeId(arr[i].pages[j]);

        }
      }

      // Do we need articles when loading pages?
      // Yeah sure for showing tiles and stuff, but we dont need content, it might be big big
      arr[i].articles = await ArticleModel.find({ page: arr[i]._id, public: true }, excludedArticleOptions);
      arr[i] = excludeId(arr[i]);
      // This is if we ever want to nest it more than it is already, like adding all curent pages to some category
      // For example on website we will have dedicated section Development etc
      // For now it's not in plan, and it's not implemented in Frontend Application

      // To make it nicer if i ever add so much nesting just i will just make recursive function that does job for me :)

      // It's tested and works :)

      // if (arr[i].pages.length) {
      //   for (let j = 0; j < arr[i].pages.length; j++) {
      //     arr[i].pages[j].pages = await PageModel.find({ parentPage: arr[i].pages[j]._id });
      //   }
      // }
    }

    res.status(200).send(arr[0]);
  },

};
