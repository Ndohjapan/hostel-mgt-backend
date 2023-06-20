const { param, validationResult } = require("express-validator");
const en = require("../../locale/en");
const ValidationException = require("../error/validation-exception");

const validateUserId = [
  param("id")
    .not()
    .isEmpty()
    .withMessage(en.id_null)
    .bail()
    .isString()
    .withMessage(en.id_format),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    next();
  },
];

module.exports = { validateUserId };