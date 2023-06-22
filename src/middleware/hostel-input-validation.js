const { param, validationResult, check } = require("express-validator");
const en = require("../../locale/en");
const ValidationException = require("../error/validation-exception");

const validateHostelId = [
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

const validateHostelDataInput = [
  check("name")
    .notEmpty()
    .withMessage(en.name_null)
    .bail()
    .isString()
    .withMessage(en.email_format),
  check("maxPerRoom")
    .notEmpty()
    .withMessage(en.max_per_room_null)
    .bail()
    .isNumeric()
    .withMessage(en.max_per_room_format),
  check("sex")
    .notEmpty()
    .withMessage(en.sex_null)
    .bail()
    .isString()
    .withMessage(en.sex_format),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    next();
  }
];

const validateUpdateHostelDataInput = [
  check("maxPerRoom")
    .optional()
    .isInt({min: 1})
    .withMessage(en.max_per_room_format),
  check("sex")
    .optional()
    .isString()
    .isIn(["Male", "Female"])
    .withMessage(en.sex_format),
      
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    next();
  }
];

module.exports = { validateHostelId, validateHostelDataInput, validateUpdateHostelDataInput };
