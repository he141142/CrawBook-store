const BaseRouter = require("../base/base");
const BookScraperService = require("./BookScraperService");
const CustomResponse = require("../../Middleware/response");
const nextErr = require("../../Middleware/handling/handerError");
const {ErrorHandler} = require("../../Middleware/handling/ErrorHandle");
const BookShopScrape = require("./bookShopOrg");
module.exports = class BookScraperRouter extends BaseRouter {
  bookScraperService = null;
  bookShopScrape = new BookShopScrape();

  constructor() {
    const bookScraperService = new BookScraperService();
    super(bookScraperService);
    this.get("/books-scraper", this.crawUrl);
    this.get("/bookShopScrape",this.crawbookShopScrape);
    this.get("/crawFictionInSpecificLink",this.crawFictionInSpecificLink);
  }

  crawUrl = async (req, res, next) => {
    const urls = await this._service.crawUrl(req);
    if (urls instanceof Error) {
      return nextErr(new ErrorHandler(400, urls.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, urls);
  }

  crawbookShopScrape = async (req, res, next) => {
    const data = await this.bookShopScrape.crawWebsite();
    if (data instanceof Error) {
      return nextErr(new ErrorHandler(400, data.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, data);
  }

  crawFictionInSpecificLink =async (req, res, next) =>{
    const data = await this.bookShopScrape.CrawByFictionInSpecificLink(req.query.link);
    if (data instanceof Error) {
      return nextErr(new ErrorHandler(400, data.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, data);
  }

}