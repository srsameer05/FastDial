module.exports = (fn) => {
  return (req, res, next) => {
    // passing err in next middleware will immediately invoke global errorhandler
    fn(req, res, next).catch((err) => next(err));
  };
};
