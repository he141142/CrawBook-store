const BaseService = require("../base/base-services");
const logger = require("../../utils/logger");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const axios = require("axios");
const config = require("../../config/config");
const proxyChain = require('proxy-chain');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: 'bd0e5b011bd602d30db7990fd6b5fdb1' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
      },
      visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)
const randomUseragent = require('random-useragent');
const userAgent = require('user-agents');

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
  /**
   *
   * @type {boolean}
   */
  browserCfg = {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    executablePath: config.EXECUTABLE_PART,
    ignoreHTTPSErrors: true, dumpio: false
  }

  // browserCfg = {
  //   headless: false,
  //   ignoreDefaultArgs: ['--disable-extensions'],
  //   ignoreHTTPSErrors: true,
  //   args: [
  //     '--disable-web-security',
  //     '--disable-dev-shm-usage',
  //     '--no-sandbox',
  //     '--disable-setuid-sandbox',
  //     '--disable-gpu',
  //     '--ignore-certificate-errors',
  //     '--enable-features=NetworkService'
  //   ],
  // }
  useProxy = true;
  proxy = {
    protocol: config.CRAW_PROTOCOL,
    host: config.CRAW_HOST, // Free proxy from the list
    port: config.CRAW_PORT,
  }

  resolveRecaptcha =async (page) =>{
    const {
      captchas,
      filtered,
      solutions,
      solved,
      error
    } =await page.solveRecaptchas();
    console.log( captchas,
        filtered,
        solutions,
        solved,
        error)
  }
  getHtml = async (url,waitUntilElm=null) => {
    logger.info("url : " + this.url)
    logger.info("Use headless: " + this.useHeadless)
    return this.useHeadless ? await this.getHtmlPlaywright(url,waitUntilElm)
        : await this.getHtmlAxios(url);
  };

  doAgain = async (task,...param) =>{
    return await (task(...param));
  }


  getHtmlPlaywright = async (url,waitUntilElm=null) => {
    logger.info("url: " + url)
    // const newProxyUrl = await proxyChain.anonymizeProxy(this.oldProxy);

    const browser = await puppeteer.launch({
      ...this.browserCfg,
      args: [
        `--window-size=600,1000`,
        "--window-position=000,000",
        "--disable-dev-shm-usage",
        '--no-sandbox', '--disable-setuid-sandbox',
        `args: ['--proxy-server=socks5://localhost:8002']`,
        '--user-data-dir="/tmp/chromium"',
        "--disable-web-security",
        "--disable-features=site-per-process",
      ],
    });
    try {
      console.log("Lauching playwright: " + {...this.browserCfg})
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({referrer: config.HTTP_HEADER_REFERRER});
      // await page.setUserAgent(userAgent.toString());
      await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')

      await page.setJavaScriptEnabled(true);
      await page.setDefaultNavigationTimeout(9000000);
      await page.goto(url, {
        waitUntil: 'load',
        timeout: 0
      });
      const session = await page.target().createCDPSession();
      await session.send('Page.enable');
      await session.send('Page.setWebLifecycleState', {state: 'active'});
      await page.waitForTimeout(5000);
      await page.goto(url);
      // const {
      //   captchas,
      //   filtered,
      //   solutions,
      //   solved,
      //   error
      // } =await page.solveRecaptchas();
      // console.log( captchas,
      //     filtered,
      //     solutions,
      //     solved,
      //     error)
      await this.resolveRecaptcha(page);
      // await page.waitForNavigation({waitUntil: 'networkidle2'});
      if(waitUntilElm)
      await page.waitForSelector(waitUntilElm,{timeout: 2000});
      const html = await page.content();
      await browser.close();
      return html;
    }catch (e) {
      await browser.close();
      logger.info("let do this again!")
      return this.doAgain(this.getHtmlPlaywright,url,waitUntilElm);
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

  loadHtmlCheerio = async (url,waitUntilElm=null) => {
    const html = await this.getHtml(url,waitUntilElm);
    return cheerio.load(html);
  }

  sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  getTextOfElm = (elm) => {

    return elm ? dataUntil.replaceWhiteSpaceAndn(elm.text()) : null;
  }

}