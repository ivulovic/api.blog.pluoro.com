const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    path: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().default(""),
    public: Joi.boolean().default(false),
    application: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow(null),
    parentPage: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow(null)
  }),
  update: Joi.object().keys({
    path: Joi.string(),
    title: Joi.string(),
    description: Joi.string().allow(""),
    public: Joi.boolean(),
    application: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow(null),
    parentPage: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .allow(null)
  })
};
