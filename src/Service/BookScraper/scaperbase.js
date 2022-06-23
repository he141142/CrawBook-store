const BaseService = require("../base/base-services");
const logger = require("../../utils/logger");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer-extra');
const axios = require("axios");
const config = require("../../config/config");
const proxyChain = require('proxy-chain');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const randomUseragent = require('random-useragent');
const dataUntil = require("../../utils/index");

module.exports = class BaseScraper extends BaseService {
  BOOK_DATA_PATH = "/queerRomancePack.json";
  url = null;
  useHeadless = true;
  cheerio = require("cheerio");
  oldProxy = config.PROXY_SERVER;
  dataUtilInstance = dataUntil;
  constructor() {
    super("books", []);
  }

  USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';

  waitForNavigation = false;
  maxVisits = 30;
  visited = new Set();
  allProducts = [];
  browserCfg = {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    executablePath: config.EXECUTABLE_PART,
    ignoreHTTPSErrors: true, dumpio: false
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
    logger.info("url: " + url)
    const newProxyUrl = await proxyChain.anonymizeProxy(this.oldProxy);

    const browser = await puppeteer.launch({
      ...this.browserCfg,
      args: [
        '--no-sandbox', '--disable-setuid-sandbox',
        `args: ['--proxy-server=socks5://localhost:8002']`
      ],
    });
    try {
      console.log("Lauching playwright: " + {...this.browserCfg})
      const page = await browser.newPage();
      const userAgent = randomUseragent.getRandom();
      const UA = userAgent || this.USER_AGENT;
      // const navigationPromise = page.waitForNavigation();
      await page.setExtraHTTPHeaders({referrer: config.HTTP_HEADER_REFERRER});
      await page.setUserAgent(UA);
      await page.setJavaScriptEnabled(true);
      // await page.setDefaultNavigationTimeout(config.DEFAULT_NAVIGATION_TIMEOUT);
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 0
      });
      await page.goto(url);
      const html = await page.content();
      await browser.close();
      return html;
    }catch (e) {
      console.log(e)
    }finally {
      await browser.close();
    }
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

  getTextOfElm = (elm) => {

    return elm ? dataUntil.replaceWhiteSpaceAndn(elm.text()) : null;
  }

}