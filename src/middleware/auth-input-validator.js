const { check, validationResult } = require("express-validator");
const en = require("../../locale/en");
const ValidationException = require("../error/validation-exception");

const validatePorterLoginInput = [
  check("email")
    .notEmpty()
    .withMessage(en.email_null)
    .bail()
    .isString()
    .withMessage(en.email_format)
    .bail()
    .isEmail()
    .withMessage(en.email_format),
  check("password")
    .notEmpty()
    .withMessage(en.password_null)
    .bail()
    .isString()
    .withMessage(en.password_format),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    next();
  }
];

module.exports = {validatePorterLoginInput};