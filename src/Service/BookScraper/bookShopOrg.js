const BaseScraper = require("./scaperbase")
const cheerio = require("cheerio");
const logger = require("../../utils/logger");
const {
  mkdirSync,
  writeToFile,
  getAbsoulutePathJSONStorage,
  writeJSONFile,
  getJsonFile
} = require(
    "../../utils/fileUtils")
const config = require("../../config/config")
const DataUtils = require("../../utils/index")
const crawBookConstants = require("./constatnts");
const queue = require("./queue")
module.exports = class BookShopScrape extends BaseScraper {
  books = [];
  queue = new queue();
  constructor() {
    super();
    try {
      mkdirSync(config.BASE_PATH + "/jsonStorage");
      console.log("base path: " + config.BASE_PATH)
    } catch (e) {
      logger.error("jsonStorage May be not initialized!");
    }
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
      const allFictionTitle = this.getAllFictionTitle($);
      /**
       * WRITE JSON FILE
       * @type {string}
       */
      const data = JSON.stringify(allFictionTitle);
      writeToFile(getAbsoulutePathJSONStorage() + "/test.json", data)
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

  extractBookInViewMore = async (linkToVisit) => {
    try {
      const $ = await this.loadHtmlCheerio(linkToVisit);
      let linkSiteObject = this.getLinkSites($);
      let linkPages = linkSiteObject.linkPage;
      console.log("link pages: " + linkPages);
      let BooksOver = (linkPages.length === 0 || !linkPages)
          ? await this.exTractBookInSubTypePerPage(
              $)
          :
          [].concat(await this.exTractBookInSubTypePerPage($)).concat(
              ...await Promise.all(linkPages.map(async link => {
                const q = await this.loadHtmlCheerio(link);
                return await this.exTractBookInSubTypePerPage(q);
              })))
      await BooksOver;
      console.log("BooksOver: " + BooksOver)
      return BooksOver;
    } catch (e) {
      console.log(e);
      return new Error("Internal server");
    }
  }

  exTractBookInSubTypePerPageOnlyOnePage = ($) => {
    return $("div.border-b-not-last").map(
        (_, book) => {
          const linkDetail = this.url.substring(0, this.url.length - 1)
              + DataUtils.replaceWhiteSpaceAndn(
                  $(book).find("h1.font-serif-bold").find("a").attr("href"));
          const bookInstance = {
            bookName: DataUtils.replaceWhiteSpaceAndn(
                $(book).find("h2.leading-tight").find("a").text()),
            bookAuthor: DataUtils.replaceWhiteSpaceAndn(
                $(book).find("h3.text-s").text()),
            bookPrice: DataUtils.replaceWhiteSpaceAndn(
                $(book).find("div.pb-4").find("div").text()),
            linkDetail,
          }
          console.log("bookInstance: " + bookInstance)
          return {
            ...bookInstance
          }
        }
    ).toArray();
  }

  exTractBookInSubTypePerPage = ($) => {
    return $("div.booklist").find("div.booklist-book").map(
        async (_, book) => {
          const linkDetail = this.url.substring(0, this.url.length - 1)
              + DataUtils.replaceWhiteSpaceAndn(
                  $(book).find("h2.leading-tight").find("a").attr("href"));
          const bookInstance = {
            bookName: DataUtils.replaceWhiteSpaceAndn(
                $(book).find("h2.leading-tight").find("a").text()),
            bookAuthor: DataUtils.replaceWhiteSpaceAndn(
                $(book).find("h3.text-s").text()),
            bookPrice: DataUtils.replaceWhiteSpaceAndn(
                $(book).find("div.pb-4").find("div").text()),
            linkDetail,
          }
          console.log("bookInstance: " + bookInstance)
          return {
            ...bookInstance
          }
        }
    ).toArray()
  }

  extractBookDetails = async ($,bookOvers) => {

  }

  getLinkSites = ($) => {
    const getSpanTagContainATag = $('nav.pagination').find('span.page');
    let prefix = config.CRAW_URL;
    return {
      totalPage: getSpanTagContainATag.length,
      linkPage: getSpanTagContainATag.find("a").map(
          (_, a) => prefix.substring(0, this.url.length - 1) + $(a).attr("href")
      ).toArray()
    }
  }



  extractBookDetail = ($) => {
    try {
      const mb8List = $(".grid.grid-cols-auto-1.col-gap-2");
      const bookDetail = {
        ...this.getBookDetailElm(mb8List, $)
      };
      return {
        bookDetail,
        Author: {
          name: this.dataUtilInstance.replaceWhiteSpaceAndn(
              $(`span[itemprop="${crawBookConstants.itemprop.AUTHOR}"]`).find(
                  "span").text()),
          about:
              this.dataUtilInstance.replaceWhiteSpaceAndn(
                  $(".space-y-4.show-lists").children("div").text())
        },
        bookImage: $(`img[itemprop="${crawBookConstants.itemprop.IMAGE}"]`).attr(
            "src")
      }
    } catch (e) {
      return e;
    }
  }

  getOffers = ($) => {
    return $(`div[itemprop="${crawBookConstants.itemprop.OFFER}"]`)
  }

  getBookDetailElm = (mb8List, $) => {
    try {
      this.dataUtilInstance.consoleLogWithColor(this.getDescription($));

      return {
        price: this.getOffers($).find(
            "b").text(),
        sale: this.getOffers($).find(
            ".line-through").text(),
        PublishDate: this.getTextOfElm(
            $(`div[itemprop="${crawBookConstants.itemprop.PUBLISH_DATE}"]`)),
        Publisher: this.getTextOfElm(
            $(`div[itemprop="${crawBookConstants.itemprop.PUBLISHER}"]`)),
        Pages: this.getTextOfElm(
            $(`div[itemprop="${crawBookConstants.itemprop.NUMBER_OF_PAGES}"]`)),
        Dimensions: this.getTextOfElm(
            $(`div[itemprop="${crawBookConstants.itemprop.DIMENSION}"]`)),
        Languages: this.getTextOfElm(
            $(`div[itemprop="${crawBookConstants.itemprop.LANGUAGE}"]`)),
        Type:
            this.getTextOfElm(
                $(`div[itemprop="${crawBookConstants.itemprop.TYPE}"]`)),
        description: this.getDescription($)
      }
    } catch (e) {
      return e;
    }

  }

  getDescription = ($) => {
    try {
      const description = $(`div[itemprop="${crawBookConstants.itemprop.DESCRIPTION}"]`);
      const brList = description.find("br");
      let arr = [];
      for (const elm of brList) {
        let paragraph =
            elm.nextSibling.nodeValue;
        if (paragraph) {
          arr.push(paragraph);
        }
      }
      return arr;
    } catch (e) {
      return e;
    }

  }

  readBookFromDatabase = async () => {
    try {
      return await getJsonFile(this.BOOK_DATA_PATH);
    } catch (e) {
      return new Error(e.message);
    }
  }

  readBookFromDatabase = async (path) => {
    try {
      return await getJsonFile(path);
    } catch (e) {
      return new Error(e.message);
    }
  }

  extractBooksFromStorage = async (linkAccordingFile,specialCharacter=null) => {
    try {
      const fileName = DataUtils.extractFileName(linkAccordingFile,specialCharacter);
      console.log("fileName"+fileName)
      return await getJsonFile(fileName);
    } catch (e) {
      console.log(e)
      return e;
    }
  }

  goToBookDetail = async (book, q = null) => {
    try {
      if (q) {
        q.visited.add(book.linkDetail);
        console.log("q running: " + q.running);
      }
      const waitUntilElm = ".grid.grid-cols-auto-1.col-gap-2";
      const $ = await this.loadHtmlCheerio(book.linkDetail,waitUntilElm);
      const bookDetail = this.extractBookDetail($);
      book.bookDetail = bookDetail;
      this.dataUtilInstance.consoleLogWithColor("bookDetail Crawl: ");
      this.dataUtilInstance.consoleLogWithColor(book)
      this.books.push(book);
      return bookDetail;
    } catch (e) {
      console.log(e);
      return e;
    }

  }

  extractBooksDetailFromLocal = async (linkAccordingFile) => {
    try {
      console.log("linkAccordingFile"+linkAccordingFile)
      let specialCharacter = linkAccordingFile.includes("?") ? "?" : null;
      const books = await this.extractBooksFromStorage(linkAccordingFile,specialCharacter);
      // const links = books.map(book => {
      //   return book;
      // });
      this.dataUtilInstance.consoleLogWithColor("link extract from database: ");
      this.dataUtilInstance.consoleLogWithColor(books);

      const nonVisited = books
      .filter(book => !this.queue.visited.has(book.linkDetail))
      for (const b of nonVisited) {
        await this.queue.enqueue(this.queue.crawlTask, b.linkDetail,
            this.goToBookDetail, b, this.queue);
        // await this.sleep(5000);
      }
    } catch (e) {
      console.log(e)
      return e
    }
  }

  runCrawBookDetailFromLocal = async (linkAccordingFile) => {
    await this.queue.enqueue(this.extractBooksDetailFromLocal,
        linkAccordingFile);
    return this.books;
  }

  extractBookOnePage = async (link) => {
    try {
      const $ = await this.loadHtmlCheerio(link);
      const BooksOver = await Promise.all(
          await this.exTractBookInSubTypePerPage($));

      console.log("BooksOver: " + BooksOver)
      return BooksOver;
    } catch (e) {
      console.log(e);
      return new Error("Internal server");
    }
  }

  getTitle = ($) => {
    return $(".caption").find("h1.leading-tight").text();
  }
}

