const ArticleModel = require("../models/article.model");
const PageModel = require("../models/page.model");
const { Unauthorized } = require("../helpers/response.helper");

module.exports = {
  create: async (req, res) => {
    const content = req.value.body;
    content.createdAt = Date.now();
    content.createdBy = req.decoded.user;
    const objToSave = new PageModel(content);
    await objToSave.save();
    res.status(200).send(objToSave);
  },
  list: async (req, res) => {
    // Starts from routes that dont have parent ones
    const arr = await PageModel.find({ parentRoute: null, public: true });

    // Then for each find it's subroutes if they exist
    for (let i = 0; i < arr.length; i++) {
      arr[i].routes = await PageModel.find({ parentRoute: arr[i]._id, public: true });

      // This will get articles basic stuff for every page
      if (arr[i].routes.length) {
        for (let j = 0; j < arr[i].routes.length; j++) {
          // If this ever starts to lag and website goes getting initial data really really slow, then add this
          // { content: 0 }
          // and then call request for getting only content of article by ID you find there in already loaded data.
          arr[i].routes[j].articles = await ArticleModel.find({ page: arr[i].routes[j]._id, public: true }).sort("-createdAt");
        }
      }

      // Do we need articles when loading routes?
      // Yeah sure for showing tiles and stuff, but we dont need content, it might be big big
      arr[i].articles = await ArticleModel.find({ page: arr[i]._id, public: true }, { content: 0 });

      // This is if we ever want to nest it more than it is already, like adding all curent pages to some category
      // For example on website we will have dedicated section Development etc
      // For now it's not in plan, and it's not implemented in Frontend Application

      // To make it nicer if i ever add so much nesting just i will just make recursive function that does job for me :)

      // It's tested and works :)

      // if (arr[i].routes.length) {
      //   for (let j = 0; j < arr[i].routes.length; j++) {
      //     arr[i].routes[j].routes = await PageModel.find({ parentRoute: arr[i].routes[j]._id });
      //   }
      // }
    }

    res.status(200).send(arr);
  },
  listAll: async (req, res) => {
    const arr = await PageModel.find();
    res.status(200).send(arr);
  },
  listApplicationPages: async (req, res) => {
    const arr = await PageModel.find({ createdBy: req.decoded.user, application: req.value.params.id });
    res.status(200).send(arr);
  },
  remove: async (req, res) => {
    const { id } = req.value.params;

    const obj = await PageModel.findOne({ createdBy: req.decoded.user, _id: id });
    if (!obj) {
      obj.send(403).send(Unauthorized);
      return;
    }


    const arr = await PageModel.find({ parentPage: id });

    // Then for each find it's subroutes if they exist

    for (let i = 0; i < arr.length; i++) {
      // This is if we ever want to nest it more than it is already, like adding all curent pages to some category
      // For example on website we will have dedicated section Development etc
      // For now it's not in plan, and it's not implemented in Frontend Application

      // It's tested and works :)

      // arr[i].routes = await PageModel.find({ parentRoute: arr[i]._id });

      // if (arr[i].routes.length) {
      //   for (let j = 0; j < arr[i].routes.length; j++) {
      //     await PageModel.findByIdAndRemove(arr[i].routes[j]._id);
      //   }
      // }

      // remove subroute
      await PageModel.findByIdAndRemove(arr[i]._id);
    }

    let articlesArr = await ArticleModel.find({ page: id });

    // Remove articles
    for (let i = 0; i < articlesArr.length; i++) {
      await ArticleModel.findByIdAndRemove(articlesArr[i]._id);
    }

    // then remove main one
    const objToRemove = await PageModel.findByIdAndRemove(id);

    res.status(200).send(objToRemove);
  },
  update: async (req, res) => {
    const { id } = req.value.params;
    const content = req.value.body;
    const objToSave = await PageModel.findByIdAndUpdate(id, content);
    res.status(200).send({ ...objToSave._doc, ...content });
  },
};
