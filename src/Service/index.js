const logger = require("../utils/logger");
const express = require("express");
const CrawlerRouter = require('./Crawler/index');
const BookScraperRouter = require('./BookScraper/index');

const BaseRouter = require('./base/base');
const {responseEnhancer} = require("express-response-formatter");

module.exports = class InitialService {
  _service = null;
  _app = null;
  _router = null;

  constructor(app) {
    if (!app) {
      logger.warn("service may not been initialized!");
    }

    this._app = app;
    this._router = express.Router();
    app.use(responseEnhancer());

    app.use("/api", this._router);
    this.crawlerRouter = new CrawlerRouter();
    this.crawBookRouter = new BookScraperRouter();
    // this.baseRouter = new BaseRouter();
  }
  registerService = () => {
    logger.info("Initializing service...");
    this._router.use("/", this.crawlerRouter);
    this._router.use("/book-crawler",this.crawBookRouter);
  };
};