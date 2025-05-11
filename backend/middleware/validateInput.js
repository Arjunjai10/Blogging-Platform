const Joi = require('joi');

// User registration validation
const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .required()
    .pattern(/^[a-zA-Z0-9_]+$/),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'io'] } })
    .required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
  bio: Joi.string()
    .max(200)
    .optional(),
  profilePicture: Joi.string()
    .optional()
});

// Login validation
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'io'] } })
    .required(),
  password: Joi.string()
    .required()
});

// Post creation validation
const postSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(100)
    .required(),
  content: Joi.string()
    .min(10)
    .required(),
  categories: Joi.array()
    .items(Joi.string())
    .min(1)
    .required(),
  tags: Joi.array()
    .items(Joi.string())
    .optional(),
  status: Joi.string()
    .valid('draft', 'published')
    .required()
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  postSchema
};
