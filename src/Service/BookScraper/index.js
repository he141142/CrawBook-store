const BaseRouter = require("../base/base");
const BookScraperService = require("./BookScraperService");
const CustomResponse = require("../../Middleware/response");
const nextErr = require("../../Middleware/handling/handerError");
const {ErrorHandler} = require("../../Middleware/handling/ErrorHandle");
module.exports = class BookScraperRouter extends BaseRouter {
  bookScraperService = null;

  constructor() {
    const bookScraperService = new BookScraperService();
    super(bookScraperService);
    this.get("/books-scraper", this.crawUrl);
  }

  crawUrl = async (req, res, next) => {
    const urls = await this._service.crawUrl(req);
    if (urls instanceof Error) {
      return nextErr(new ErrorHandler(400, urls.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, urls);
  }

}