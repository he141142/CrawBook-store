//using express-response formatter
//use for middleware response
module.exports.SendResponse = (res, statuscode, messageObject) => {
  const DataUtils = require("../utils/index");
  if (!DataUtils.isNumber(statuscode)) {
    statuscode = DataUtils.toNumber(statuscode); //convert to number
  }
  switch (statuscode) {
    case 200:
      return res.formatter.ok(messageObject);
    case 201:
      return res.formatter.created(messageObject);
    case 202:
      return res.formatter.accepted(messageObject);
    case 204:
      return res.formatter.noContent(messageObject);
    case 400:
      return res.formatter.badRequest(messageObject);
    case 401:
      return res.formatter.unauthorized(messageObject);
    case 403:
      return res.formatter.forbidden(messageObject);
    case 404:
      return res.formatter.notFound(messageObject);
    case 405:
      return res.formatter.methodNotAllowed(messageObject);
    case 408:
      return res.formatter.timeout(messageObject);
    case 422:
      return res.formatter.unprocess(messageObject);
    case 429:
      return res.formatter.tooManyRequests(messageObject);
    case 500:
      return res.formatter.serverError(messageObject);
    case 502:
      return res.formatter.badGateway(messageObject);
  }
  if (statuscode < 400) {
    return res.formatter.ok(data, messageObject);
  }
  if (statuscode >= 400) {
    return res.formatter.badRequest(messageObject);
  }
};
