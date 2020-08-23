const router = require("express-promise-router")();
const { validateBody, validateParams } = require("../helpers/route.helper");
const articleSchema = require("../schemas/article.schema");
const commonSchema = require("../schemas/common.schema");
const tokenMiddleware = require("../middlewares/token.middleware");
const ArticleController = require("../controllers/article.controller");

// router.route("/").get(ArticleController.list);

router.use(tokenMiddleware);

router.route("/").post([validateBody(articleSchema.create)], ArticleController.create);

// router.route("/all").get(ArticleController.listAll);

router
  .route("/:id")
  .get([validateParams(commonSchema.objectId, "id")], ArticleController.listPageArticles)
  .patch([validateParams(commonSchema.objectId, "id"), validateBody(articleSchema.update)], ArticleController.update)
  .delete([validateParams(commonSchema.objectId, "id")], ArticleController.remove);
module.exports = router;
