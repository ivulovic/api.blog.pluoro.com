const router = require("express-promise-router")();
const { validateParams } = require("../helpers/route.helper");
const commonSchema = require("../schemas/common.schema");

const ContentController = require("../controllers/content.controller");

router
  .route("/")
  .get(ContentController.appStructure)
module.exports = router;
