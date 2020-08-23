const Joi = require("joi");

module.exports = {
  objectId: Joi.object().keys({
    param: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  }),
}