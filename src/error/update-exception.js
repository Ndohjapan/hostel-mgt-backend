const en = require("../../locale/en");

module.exports = function UpdateException(message, status) {
  this.status = status || 400;
  this.message = message || en.update_error;
};
  