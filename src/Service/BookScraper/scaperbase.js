const BaseService = require("../base/base-services");
const logger = require("../../utils/logger");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios");
const config = require("../../config/config");
module.exports = class BaseScraper extends BaseService {
  url = null;
  useHeadless = true;
  cheerio = require("cheerio");

  constructor() {
    super("books", []);
  }

  waitForNavigation = false;
  maxVisits = 30;
  visited = new Set();
  allProducts = [];
  browserCfg = {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    executablePath: config.EXECUTABLE_PART
  }
  useProxy = true;
  proxy = {
    protocol: config.CRAW_PROTOCOL,
    host: config.CRAW_HOST, // Free proxy from the list
    port: config.CRAW_PORT,
  }

  getHtml = async url => {
    logger.info("url : " + this.url)
    logger.info("Use headless: " + this.useHeadless)
    return this.useHeadless ? await this.getHtmlPlaywright(url)
        : await this.getHtmlAxios(url);
  };

  getHtmlPlaywright = async url => {
    const puppeteer = require('puppeteer');
    logger.info("url: " + url)
    const browser = await puppeteer.launch({
      ...this.browserCfg
    });
    console.log("Lauching playwright: " + {...this.browserCfg})
    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation();
    await page.setExtraHTTPHeaders({referrer: config.HTTP_HEADER_REFERRER});
    // await page.setDefaultNavigationTimeout(config.DEFAULT_NAVIGATION_TIMEOUT);
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 0
    });
    await page.goto(url);
  await navigationPromise;
    const html = await page.content();
    // await browser.close();
    return html;
  };

  getHtmlAxios = async url => {
    logger.info(`
    proxy: {
        port: ${this.proxy.port},
        host: ${this.proxy.host},
        protocol: ${this.proxy.protocol},
    }`)
    try {
      const {data} = this.useProxy ? await axios.get(url, {
            proxy: {...this.proxy}
          }
      ) : await axios.get(url);
      return data;
    } catch (e) {
      logger.error(e.message)
    }
  };

  setUrl = (url) => {
    this.url = url;
  }

  getCheerio = () => {
    return this.cheerio;
  }

  loadHtmlCheerio = async () => {
    const html = await this.getHtml(this.url);

    return cheerio.load(html);
  }

  loadHtmlCheerio = async (url) => {
    const html = await this.getHtml(url);

    return cheerio.load(html);
  }

  sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


}