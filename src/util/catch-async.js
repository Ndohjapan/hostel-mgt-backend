// Create a middleware function to wrap APIs
module.exports = (handler) => {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
};