const BaseService = require('../base/base-services');
const axios = require("axios");
const logger = require("../../utils/logger")
const cheerio = require("cheerio");
const config = require("../../config/config");
module.exports = class BookScraperService extends BaseService {
  _model = null;
  _include = [];
  useHeadless = false;
  maxVisits = 30;
  visited = new Set();
  allProducts = [];
  useProxy = true;
  proxy = {
    protocol: config.CRAW_PROTOCOL,
    host: config.CRAW_HOST, // Free proxy from the list
    port: config.CRAW_PORT,
  }
  url = "https://vn1lib.org/s/hi/?signAll=1&ts=0117";

  constructor() {
    super("books", []);
  }

  setUrl = (pattern) => {
    this.url = `https://vn1lib.org/s/${pattern}?page=1`
  }
  getHtmlAxios = async url => {
    logger.info(`
    proxy: {
        port: ${this.proxy.port},
        host: ${this.proxy.host},
        protocol: ${this.proxy.protocol},
    }`)
    try{
      const {data} = this.useProxy ? await axios.get(url, {
            proxy: {...this.proxy}
          }
      ) : await axios.get(url);
      return data;
    }catch (e){
      logger.error(e.message)
    }
  };

  extractUrl = ($) => {
    return $('.paginator').find('td').map(
        (_, td) => {
          console.log(td)
          return $(td).find('a').attr('href');
        }
    ).toArray();
  }

  crawUrl = async (req) => {
    const {pattern} = req.query;
    logger.info(pattern)
    try {
      this.setUrl(pattern);
      const html = await this.getHtml(this.url);
      console.log(this.url)
      console.log(html)
      const $ = cheerio.load(html);
      const links = {
        craw_url: this.url,
        url_extract: this.extractUrl($)
      };
      const dataRes = {
        proxy:{
          ...this.proxy
        },
        dataResponse: links
      }
      logger.info(dataRes);
      return dataRes;
    } catch (e) {
      logger.error(e.message);
      return e;
    }
  }

  getHtml = async url => {
    logger.info("Use headless: "+this.useHeadless)
    return this.useHeadless ? await this.getHtmlPlaywright(url)
        : await this.getHtmlAxios(url);
  };

}