const router = require("express-promise-router")();
const { validateBody, validateParams } = require("../helpers/route.helper");
const pageSchema = require("../schemas/page.schema");
const commonSchema = require("../schemas/common.schema");
const tokenMiddleware = require("../middlewares/token.middleware");
const PageController = require("../controllers/page.controller");


router.use(tokenMiddleware);

// router.route("/").get(PageController.list);

router.route("/").post([validateBody(pageSchema.create)], PageController.create);

// router.route("/all").get(PageController.listAll);

router
  .route("/:id")
  .get([validateParams(commonSchema.objectId, "id")], PageController.listApplicationPages)
  .patch([validateParams(commonSchema.objectId, "id"), validateBody(pageSchema.update)], PageController.update)
  .delete([validateParams(commonSchema.objectId, "id")], PageController.remove);
module.exports = router;
