const router = require("express-promise-router")();
const { validateBody, validateParams } = require("../helpers/route.helper");
const applicationSchema = require("../schemas/application.schema");
const commonSchema = require("../schemas/common.schema");
const tokenMiddleware = require("../middlewares/token.middleware");
const ApplicationController = require("../controllers/application.controller");

router.use(tokenMiddleware);

router.route("/").get(ApplicationController.list);


router.route("/").post([validateBody(applicationSchema.create)], ApplicationController.create);

router
  .route("/:id")
  .patch([validateParams(commonSchema.objectId, "id"), validateBody(applicationSchema.update)], ApplicationController.update)
  .delete([validateParams(commonSchema.objectId, "id")], ApplicationController.remove);
module.exports = router;
