const BaseRouter = require('../base/base')
const logger = require("../../utils/logger");
const CrawlerService = require('./CrawlerService');
const axios = require('axios');
const cheerio = require('cheerio');
const playwright = require('playwright');

const CustomResponse = require("../../Middleware/response");
module.exports = class CrawlerRouter extends BaseRouter {
  url = 'https://scrapeme.live/shop/page/1/';
  useHeadless = true; // "true" to use playwright
  maxVisits = 30; // Arbitrary number for the maximum of links visited
  visited = new Set();
  allProducts = [];

  constructor() {
    const crawlerService = new CrawlerService();
    super(crawlerService);
    this.get("/run-crawler", this.runCrawler);
    this.get("/test-extract-data", this.extractContentsReq);
    this.get('/run-queue', this.visitLink)
  }

  extractLinks = $ => [
    ...new Set(
        $('.page-numbers a') // Select pagination links
        .map((_, a) => $(a).attr(
            'href')) // Extract the href (url) from each link
        .toArray() // Convert cheerio object to array
    ),
  ];

  getHtmlPlaywright = async url => {
    const browser = await playwright.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    const html = await page.content();
    await browser.close();

    return html;
  };

  extractContents = function ($) {
    return $('.products').find('li')
    .map(
        (_, li) => $(li).find('a').map(
            (i, a) => {
              if (i == 0) {
                return {
                  link: $(a).attr('href'),
                  name: $(a).find('h2').text(),
                  price: $(a).find('span').find('span').text()

                }
              }
            }
        ).toArray()
    ).toArray();
  }

  runCrawler = (req, res) => {
    // axios.get('https://scrapeme.live/shop/')
    // .then(({ data }) => console.log(data));
    axios.get('https://scrapeme.live/shop/').then(({data}) => {
      const $ = cheerio.load(data); // Initialize cheerio
      const links = this.extractLinks($);

      console.log(links);
      // ['https://scrapeme.live/shop/page/2/', 'https://scrapeme.live/shop/page/3/', ... ]
    });
    CustomResponse.sendObject(res, 200, `success`);
  }

  extractContentsReq = (req, res) => {
    axios.get('https://scrapeme.live/shop/').then(({data}) => {
      const $ = cheerio.load(data); // Initialize cheerio
      const links = this.extractContents($);

      console.log(links);
      CustomResponse.sendObject(res, 200, {
            response: links
          }
      );
      // ['https://scrapeme.live/shop/page/2/', 'https://scrapeme.live/shop/page/3/', ... ]
    });
  }

  extractContentsReq2 = (cheerio) => {
    return (req, res) => {
      this.baseAxiosCheerio(cheerio, "https://scrapeme.live/shop/",
          this.extractContents, req, res);
    }

  }

  getHtmlAxios = async url => {
    const {data} = await axios.get(url);

    return data;
  };

  getHtml = async url => {
    return this.useHeadless ? await this.getHtmlPlaywright(url)
        : await this.getHtmlAxios(url);
  };

  crawlTask = async url => {
    if (this.visited.size >= this.maxVisits) {
      console.log('Over Max Visits, exiting');
      return;
    }

    if (this.visited.has(url)) {
      return;
    }

    await this.crawl(url);
  };

  crawl = async url => {
    this.visited.add(url);
    console.log('Crawl: ', url);
    const html = await this.getHtml(url);
    const $ = cheerio.load(html);
    const content = this.extractContents($);
    const links = this.extractLinks($);
    links
    .filter(link => !this.visited.has(link))
    .forEach(link => {
      this.q.enqueue(this.crawlTask, link);
    });
    this.allProducts.push(...content);
    // We can see how the list grows. Gotta catch 'em all!
    console.log(this.allProducts.length);
    console.log(content)
  };

  sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  queue = (concurrency = 4) => {
    let running = 0;
    const tasks = [];

    return {
      enqueue: async (task, ...params) => {
        tasks.push({task, params});
        if (running >= concurrency) {
          return;
        }

        ++running;
        while (tasks.length) {
          const {task, params} = tasks.shift();
          await task(...params);
        }
        --running;
      },
    };
  };

  q = this.queue();

  visitLink = async (req, res) => {
    await this.q.enqueue(this.crawlTask, this.url);
    CustomResponse.sendObject(res, 200, "ok")
  }

}