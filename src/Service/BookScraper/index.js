const BaseRouter = require("../base/base");
const BookScraperService = require("./BookScraperService");
const CustomResponse = require("../../Middleware/response");
const nextErr = require("../../Middleware/handling/handerError");
const {ErrorHandler} = require("../../Middleware/handling/ErrorHandle");
const BookShopScrape = require("./bookShopOrg");
const {writeJSONFile} = require("../../utils/fileUtils");
const dataUtils = require("../../utils/index");
module.exports = class BookScraperRouter extends BaseRouter {
  bookScraperService = null;
  bookShopScrape = new BookShopScrape();
  constructor() {
    const bookScraperService = new BookScraperService();
    super(bookScraperService);
    this.get("/books-scraper", this.crawUrl);
    this.get("/bookShopScrape", this.crawbookShopScrape);
    this.get("/crawFictionInSpecificLink", this.crawFictionInSpecificLink);
    this.get("/extractBookInViewMore", this.extractBookInViewMore);
    this.get("/extractBookInViewMoreFromDatabase",
        this.extractBookFromDatabase);
    this.get("/extractBookDetail",this.extractBookDetail);
    this.get("/extractBookFromLocal",this.extractBookFromLocal)
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

  crawFictionInSpecificLink = async (req, res, next) => {
    const data = await this.bookShopScrape.CrawByFictionInSpecificLink(
        req.query.link);
    if (data instanceof Error) {
      return nextErr(new ErrorHandler(400, data.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, data);
  }

  extractBookInViewMore = async (req, res, next) => {
    const data = await Promise.all(
        await this.bookShopScrape.extractBookInViewMore(
            req.query.link));
    writeJSONFile(dataUtils.extractFileName(req.query.link),data)
    console.log("data: " + data)
    if (data instanceof Error) {
      return nextErr(new ErrorHandler(400, data.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, {
      dataArr: [...data]
    });
    // console.log(arrUrlSplit)
    // CustomResponse.sendObject(res, 200, {
    //   dataArr: getEnd[getEnd.length-1]+".json"
    // });
  }

  extractBookFromDatabase = async (req, res, next) => {
    const data = await this.bookShopScrape.extractBooksFromStorage(req.query.link);
    if (data instanceof Error) {
      return nextErr(new ErrorHandler(400, data.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, {
      dataArr: [...data]
    });
  }

  extractBookDetail = async (req, res, next) => {
    const book = await this.bookShopScrape.goToBookDetail(
        req.query.link);
    if (book instanceof Error) {
      return nextErr(new ErrorHandler(400, book.message), req, res, next);
    }
    dataUtils.consoleLogWithColor(book);
    CustomResponse.sendObject(res, 200, {
      ...book
    });
  }

  extractBookFromLocal = async (req,res,next) =>{
    const data = await this.bookShopScrape.runCrawBookDetailFromLocal(req.query.link);
    if (data instanceof Error) {
      return nextErr(new ErrorHandler(400, data.message), req, res, next);
    }
    CustomResponse.sendObject(res, 200, {
      dataArr: [...data]
    });
  }

  simpleStringify = function (object) {
    var simpleObject = {};
    for (var prop in object) {
      if (!object.hasOwnProperty(prop)) {
        continue;
      }
      if (typeof (object[prop]) == 'object') {
        continue;
      }
      if (typeof (object[prop]) == 'function') {
        continue;
      }
      simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
  };




}