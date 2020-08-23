const Joi = require("joi");

module.exports = {
  create: Joi.object().keys({
    path: Joi.string().allow(""),
    title: Joi.string().required(),
    description: Joi.string().required(),
    content: Joi.string().allow(""),
    public: Joi.boolean().default(false),
    page: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
  }),
  update: Joi.object().keys({
    path: Joi.string().allow(""),
    title: Joi.string(),
    description: Joi.string(),
    content: Joi.string().allow(""),
    public: Joi.boolean().default(false),
    page: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  })
};
