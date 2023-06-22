const { param, validationResult, check } = require("express-validator");
const en = require("../../locale/en");
const ValidationException = require("../error/validation-exception");

const validateRoomId = [
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

const validateRoomDataInput = [
  check("hostel")
    .notEmpty()
    .withMessage(en.hostel_null)
    .bail()
    .isString()
    .withMessage(en.hostel_format),
  check("maxPerRoom")
    .notEmpty()
    .withMessage(en.max_per_room_null)
    .bail()
    .isInt({min: 1})
    .withMessage(en.max_per_room_format),
  check("from")
    .notEmpty()
    .withMessage(en.from_null)
    .bail()
    .isInt({min: 1})
    .withMessage(en.from_format),
  check("to")
    .notEmpty()
    .withMessage(en.to_null)
    .bail()
    .isInt({min: 1})
    .withMessage(en.to_format),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    next();
  }
];

const validateUpdateRoomDataInput = [
  check("maxPerRoom")
    .optional()
    .isInt({min: 1})
    .withMessage(en.max_per_room_format),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    next();
  }
];

module.exports = { validateRoomId, validateRoomDataInput, validateUpdateRoomDataInput };
