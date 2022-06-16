const { handleError } = require("./ErrorHandle");

const nextErr = (err, req, res, next) => {
  handleError(err, res);
};
module.exports = nextErr;
