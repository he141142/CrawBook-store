const BaseScraper = require("./scaperbase")
const cheerio = require("cheerio");
const logger = require("../../utils/logger");
const fs = require('fs');

module.exports = class BookShopScrape extends BaseScraper {

  constructor() {
    super();
    this.setUrl("https://bookshop.org/");
  }

  crawWebsite = async () => {
    try {
      const $ = await this.loadHtmlCheerio(this.url);
      const elm = this.getFictionsLink($);
      const GetAllFictionAndSubTypeLol = await this.CrawAllFiction(elm);
      logger.info(`List of Fiction: ${{
        elm
      }}`)
      const data = {
        craw_url: this.url,
        Get_this_shit: GetAllFictionAndSubTypeLol
      };
      return data;
    } catch (e) {
      return e.message;
    }

  }

  locateFiction($) {
    let flag = false;
    const listLi = $('.sub-header').find('ul.navbar').find(
        'li.navbar-item.has-dropdown');
    for (const elm of listLi) {
      /**
       *
       * */
      let href = $(elm).children('a');
      if (href.attr('href').localeCompare("/categories/m/fiction") === 0) {
        logger.info(`found href of fiction Link : ${href.attr("href")}`)
        return $(elm);
        flag = true;
      }
    }
    if (!flag) {
      throw new Error("Location not found!");
    }
  }

  /**
   * Prototype: {
   *   href: string,
   *   nameOfSubType:String
   * }
   */
  getAllFictionCategory = (elm, $) => {
    let prefix = "https://bookshop.org";
    return elm.find(".navbar-dropdown-list").find("a").map((_, a) => {
      return {
        href: prefix + $(a).attr("href"),
        nameOfSubType: $(a).text().replace(/\s/g, "").replace("\n", "")
      }

    }).toArray();
  }

  /**
   * Prototype: {
   *   href: string,
   *   nameOfSubType:String
   * }
   */
  getFictionsLink = ($) => {
    try {
      let fictionLoc = this.locateFiction($);
      return this.getAllFictionCategory(fictionLoc, $);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  CrawByFictionInSpecificLink = async (link) => {
    try {
      const $ = await this.loadHtmlCheerio(link)
      const allFictionTitle =  this.getAllFictionTitle($);
      const data = JSON.stringify(allFictionTitle);

      return allFictionTitle;
    } catch (e) {
      console.log(e);
    }
  }
  CrawAllFiction = async (arrayLinks) => {
    try {
      let AllData = [];
      let emptyObj = null;
      for (const obj of arrayLinks) {
        emptyObj = Object.assign({}, obj);
        emptyObj["ArrayOfSubType"] = await this.CrawByFictionInSpecificLink(
            obj.href);
        AllData.push(emptyObj);
      }
      return AllData;
    } catch (e) {
      console.log(e)
      throw new Error("Oops st wrong in Fn::CrawAllFiction")
    }

  }

  getAllFictionTitle = $ => {
    logger.info("entry")
    console.log("entry");
    let SubTypeObj = {};
     return  $("div.measure.grid.grid-cols-2.col-gap-4.row-gap-16").find(
        "section.col-span-2.pb-4.section").map((__, sec) => {
      const lts= $(sec).find("div.items-start").find("a").map(
          (_, a) => {
            return this.ExtractSubFictionElement($(a), _);
          }
      ).toArray();
       return  Object.assign({},...lts);
    }).toArray();
  }

  ExtractSubFictionElement = (aTagElement, inCase) => {
    switch (inCase) {
      case 1:
        return {
          href: aTagElement.attr("href"),
          name: aTagElement.text()
        }
      case 2:
        return {
          viewMoreLink: aTagElement.attr("href"),
        }
      case 0:
        return {
          publisherLink: aTagElement.attr("href"),
          publisherImg: aTagElement.find('img.avatar-light').attr('src')
        }
    }
  }

}