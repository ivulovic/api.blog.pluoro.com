const ArticleModel = require("../models/article.model");
const PageModel = require("../models/page.model");
const ApplicationModel = require("../models/application.model");
const { Unauthorized } = require("../helpers/response.helper");
const xml2js = require("xml2js");

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
const excludedArticleOptionsWithExcludedContent = {
  _id: 0,
  __v: 0,
  createdBy: 0,
  page: 0,
  content: 0,
  public: 0,
}
const excludedPageOptions = {
  __v: 0,
  createdBy: 0,
  parentPage: 0,
  application: 0,
  public: 0,
}

module.exports = {
  appStructure: async (req, res) => {

    const app = await ApplicationModel.findOne({ name: req.hostname });
    if (!app) {
      res.status(403).send(Unauthorized);
      return;
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
  getSitemap: async (req, res) => {

    const app = await ApplicationModel.findOne({ name: req.hostname });
    if (!app) {
      res.status(403).send(Unauthorized);
      return;
    }

    const mainUrl = `https://${req.hostname}`;

    const createSitemapObj = (path, tsDate, changefreq) => {
      const result = { loc: `${mainUrl}${path}`, lastmod: new Date(tsDate).toLocaleDateString("sv") }
      if (changefreq) {
        result.changefreq = changefreq;
      }
      return result;
    };

    const urls = [
      createSitemapObj('', app.createdAt),
    ];

    const applicationId = app._id;
    const arr = await PageModel.find({ application: applicationId, parentPage: null, public: true }, excludedPageOptions);
    for (let i = 0; i < arr.length; i++) {
      let lastModOfThePage = arr[i].createdAt;
      arr[i].pages = await PageModel.find({ application: applicationId, parentPage: arr[i]._id, public: true }, excludedPageOptions);
      if (arr[i].pages.length) {
        for (let j = 0; j < arr[i].pages.length; j++) {
          lastModOfThePage = arr[i].pages[j].createdAt;
          let lastModOfTheSubpage = arr[i].pages[j].createdAt;
          arr[i].pages[j].articles = await ArticleModel.find({ page: arr[i].pages[j]._id, public: true }, excludedArticleOptionsWithExcludedContent).sort("-createdAt");
          if (arr[i].pages[j].articles.length) {
            for (let k = 0; k < arr[i].pages[j].articles.length; k++) {
              lastModOfTheSubpage = arr[i].pages[j].articles[k].createdAt
              urls.push(createSitemapObj(arr[i].path + arr[i].pages[j].path + arr[i].pages[j].articles[k].path, arr[i].pages[j].articles[k].createdAt));
            }
          }
          urls.push(createSitemapObj(arr[i].path + arr[i].pages[j].path, lastModOfTheSubpage, 'weekly'));
        }
      }
      arr[i].articles = await ArticleModel.find({ page: arr[i]._id, public: true }, excludedArticleOptionsWithExcludedContent);
      if (arr[i].articles.length) {
        for (let j = 0; j < arr[i].articles.length; j++) {
          lastModOfThePage = arr[i].articles[j].createdAt;
          urls.push(createSitemapObj(arr[i].path + arr[i].articles[j].path, arr[i].articles[j].createdAt));
        }
      }
      urls.push(createSitemapObj(arr[i].path, lastModOfThePage, 'weekly'));
    }

    console.log(app, arr);

    var obj = {
      urlset: {
        $: {
          xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9"
        },
        url: urls
      }
    };

    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);
    res.set('Content-Type', 'text/xml')
    res.status(200).send(xml);
  },
  getRss: async (req, res) => {
    const app = await ApplicationModel.findOne({ name: req.hostname });
    if (!app) {
      res.status(403).send(Unauthorized);
      return;
    }
    const mainUrl = `https://${req.hostname}`;
    const createSitemapObj = (path, tsDate, description) => {
      const result = { link: `${mainUrl}${path}`, pubDate: new Date(tsDate).toLocaleDateString("sv") }
      if (description) {
        result.description = description;
      }
      return result;
    };

    const urls = [
      createSitemapObj('', app.createdAt),
    ];
    const applicationId = app._id;
    const arr = await PageModel.find({ application: applicationId, parentPage: null, public: true }, excludedPageOptions);
    for (let i = 0; i < arr.length; i++) {
      let lastModOfThePage = arr[i].createdAt;
      arr[i].pages = await PageModel.find({ application: applicationId, parentPage: arr[i]._id, public: true }, excludedPageOptions);
      if (arr[i].pages.length) {
        for (let j = 0; j < arr[i].pages.length; j++) {
          lastModOfThePage = arr[i].pages[j].createdAt;
          let lastModOfTheSubpage = arr[i].pages[j].createdAt;
          arr[i].pages[j].articles = await ArticleModel.find({ page: arr[i].pages[j]._id, public: true }, excludedArticleOptionsWithExcludedContent).sort("-createdAt");
          if (arr[i].pages[j].articles.length) {
            for (let k = 0; k < arr[i].pages[j].articles.length; k++) {
              lastModOfTheSubpage = arr[i].pages[j].articles[k].createdAt
              urls.push(createSitemapObj(arr[i].path + arr[i].pages[j].path + arr[i].pages[j].articles[k].path, arr[i].pages[j].articles[k].createdAt, arr[i].pages[j].articles[k].title, arr[i].pages[j].articles[k].description));
            }
          }
          urls.push(createSitemapObj(arr[i].path + arr[i].pages[j].path, lastModOfTheSubpage, arr[i].pages[j].title, arr[i].pages[j].description));
        }
      }
      arr[i].articles = await ArticleModel.find({ page: arr[i]._id, public: true }, excludedArticleOptionsWithExcludedContent);
      if (arr[i].articles.length) {
        for (let j = 0; j < arr[i].articles.length; j++) {
          lastModOfThePage = arr[i].articles[j].createdAt;
          urls.push(createSitemapObj(arr[i].path + arr[i].articles[j].path, arr[i].articles[j].createdAt, arr[i].articles[j].title, arr[i].articles[j].description));
        }
      }
      urls.push(createSitemapObj(arr[i].path, lastModOfThePage, arr[i].description));
    }
    var obj = {
      rss: {
        $: {
          version: '2.0',
        },
        channel: [
          {
            title: `${req.hostname} RSS`,
            link: mainUrl,
            description: `${req.hostname} website`,
            item: urls,
          }
        ]
      }
    };
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);
    res.set('Content-Type', 'text/xml')
    res.status(200).send(xml);
  },


  getAtom: async (req, res) => {
    const app = await ApplicationModel.findOne({ name: req.hostname });
    if (!app) {
      res.status(403).send(Unauthorized);
      return;
    }
    const mainUrl = `https://${req.hostname}`;
    const createSitemapObj = (path, tsDate, title, summary) => {
      const result = {};
      result.id = `${mainUrl}${path}`;
      result.link = { $: { href: `${mainUrl}${path}` } };
      result.updated = new Date(tsDate).toLocaleDateString("sv");
      if (title) {
        result.title = title;
      }
      if (summary) {
        result.summary = summary;
      }
      return result;
    };
    const urls = [];
    const applicationId = app._id;
    const arr = await PageModel.find({ application: applicationId, parentPage: null, public: true }, excludedPageOptions);
    for (let i = 0; i < arr.length; i++) {
      let lastModOfThePage = arr[i].createdAt;
      arr[i].pages = await PageModel.find({ application: applicationId, parentPage: arr[i]._id, public: true }, excludedPageOptions);
      if (arr[i].pages.length) {
        for (let j = 0; j < arr[i].pages.length; j++) {
          lastModOfThePage = arr[i].pages[j].createdAt;
          let lastModOfTheSubpage = arr[i].pages[j].createdAt;
          arr[i].pages[j].articles = await ArticleModel.find({ page: arr[i].pages[j]._id, public: true }, excludedArticleOptionsWithExcludedContent).sort("-createdAt");
          if (arr[i].pages[j].articles.length) {
            for (let k = 0; k < arr[i].pages[j].articles.length; k++) {
              lastModOfTheSubpage = arr[i].pages[j].articles[k].createdAt
              urls.push(createSitemapObj(arr[i].path + arr[i].pages[j].path + arr[i].pages[j].articles[k].path, arr[i].pages[j].articles[k].createdAt, arr[i].pages[j].articles[k].title, arr[i].pages[j].articles[k].description));
            }
          }
          urls.push(createSitemapObj(arr[i].path + arr[i].pages[j].path, lastModOfTheSubpage, arr[i].pages[j].title, arr[i].pages[j].description));
        }
      }
      arr[i].articles = await ArticleModel.find({ page: arr[i]._id, public: true }, excludedArticleOptionsWithExcludedContent);
      if (arr[i].articles.length) {
        for (let j = 0; j < arr[i].articles.length; j++) {
          lastModOfThePage = arr[i].articles[j].createdAt;
          urls.push(createSitemapObj(arr[i].path + arr[i].articles[j].path, arr[i].articles[j].createdAt, arr[i].articles[j].title, arr[i].articles[j].description));
        }
      }
      urls.push(createSitemapObj(arr[i].path, lastModOfThePage, arr[i].title, arr[i].description));
    }
    var obj = {
      feed: {
        $: {
          xmlns: "http://www.w3.org/2005/Atom"
        },
        id: mainUrl,
        link: { $: { href: mainUrl } },
        title: `${req.hostname} Atom`,
        updated: new Date(app.createdAt).toLocaleDateString("sv"),
        entry: urls,
      }
    };
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(obj);
    res.set('Content-Type', 'text/xml')
    res.status(200).send(xml);
  }
};
