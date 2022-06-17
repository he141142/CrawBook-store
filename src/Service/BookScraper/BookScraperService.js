const BaseService = require('../base/base-services');
const axios = require("axios");
const logger = require("../../utils/logger")
const cheerio = require("cheerio");
const config = require("../../config/config");
const playwright = require("playwright");
const BaseScraper = require("./scaperbase");

module.exports = class BookScraperService extends BaseScraper {
  _model = null;
  _include = [];
  constructor() {
    super();
  }


  extractUrl = ($) => {
    return $('.paginator').find('td').map(
        (_, td) => {
          let hrefAttr = $(td).find('span').find('a').attr('href');
          if (hrefAttr) {
            return "https://vn1lib.org" + hrefAttr;
          }
        }
    ).toArray();
  }
  setUrl = (pattern) => {
    this.url = `https://vn1lib.org/s/${pattern}?page=1`
  }

  extractContentsInOnePage = ($) => {

  }

  crawUrl = async (req) => {
    const {pattern} = req.query;
    logger.info(pattern)
    try {
      this.setUrl(pattern);
      const html = await this.getHtml(this.url);
      const $ = cheerio.load(html);
      const links = {
        craw_url: this.url,
        url_extract: this.extractUrl($)
      };
      const dataRes = {
        proxy: {
          ...this.proxy
        },
        dataResponse: links,
        books: this.extractContent($)
      }
      logger.info(dataRes);
      return dataRes;
    } catch (e) {
      logger.error(e);
      return e;
    }
  }

  extractContent = ($) => {
    return $('#searchResultBox').find('.resItemBox').map(
        (_, resItemBox) => {
          const r = {
            link: $(resItemBox).find(".checkBookDownloaded").find('img').attr(
                'src'),
            dta_book_id: $(resItemBox).attr('data-book_id')
          }
          return r;
        }
    ).toArray();
  }

}