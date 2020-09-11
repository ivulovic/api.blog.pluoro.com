const router = require("express-promise-router")();

const ContentController = require("../controllers/content.controller");

router
  .route("/")
  .get(ContentController.appStructure)

router
  .route("/article")
  .post(ContentController.getArticleContent)

router
  .route("/sitemap.xml")
  .get(ContentController.getSitemap)

router
  .route("/feed.rss")
  .get(ContentController.getRss)

router
  .route("/feed.atom")
  .get(ContentController.getAtom)

module.exports = router;
