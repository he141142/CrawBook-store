const { SendResponse } = require("../config/responseInterface");
class CustomResponse {
  static SendStatus = (res) => {
    res.status(200).send(
      JSON.stringify({
        status: "SUCCESS",
        statusCode: 200,
        message: "EVERY THING OK",
      })
    );
  };

  static SendStatus_WithMessage = (res, statusCode, message) => {
    let messageObject = {
      status: statusCode,
      message: message,
    };
    SendResponse(res, statusCode, messageObject);
  };

  static sendObject(res, status, object) {
    // res.status(status).send(JSON.stringify(object));
    SendResponse(res, status, object);
  }
}

module.exports = CustomResponse;
