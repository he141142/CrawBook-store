const {
  SendResponse,
} = require("../../config/responseInterface");

class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, res) => {
  const { statusCode, message } = err;

  SendResponse(res, statusCode, {
    status: "error",
    statusCode,
    message,
  });
};
module.exports = {
  ErrorHandler,
  handleError,
};
