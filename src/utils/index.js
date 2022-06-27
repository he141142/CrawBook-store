const logger = require("./logger");
const path = require("path");
const util = require('util')
class DataUtils {
  isNumber(string) {
    return (
      !isNaN(parseFloat(string)) &&
      isFinite(string) &&
      typeof string === "number"
    );
  }

  toNumber(value) {
    let number = !isNaN(parseInt(value)) ? parseInt(value) : 0;
    let dir = path.resolve(path.join(__dirname, "index.js"));
    if (number == 0)
      this.warning("toNumber(value)", dir, "return default value 0");
    return number;
  }

  warning(functionCall, message, dir) {
    logger.warn(`[${functionCall}] [${dir}] <${message}>`);
  }

  isEmpty(string) {
    const reg = /^(\s*)$/;
    return reg.test(string);
  }

  whiteSpaceChecker(string) {
    const reg = /((.\s)|(\s.))+/;
    return reg.test(string);
  }

  phoneChecker(string) {
    const reg =
      /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{3,4}$/;
    return reg.test(string);
  }

  identityNumberChecker(string) {
    const reg = /^\d{9,12}$/;
    return reg.test(string);
  }

  socialInsuranceChecker(string) {
    const reg = /^\d{5,12}$/;
    return reg.test(string);
  }

  isAlphaOnly(string) {
    const reg = /^([a-zA-Z]+\s{0,1})+[a-zA-Z]$/g;
    return reg.test(string);
  }

  
  isZeroOrOne(number) {
    if ((number == 0 || number == 1) ) {
      return true;
    }
    return false;
  }

  isValidDAte(date) {
    const reg = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    return reg.test(date)
  }

  replaceWhiteSpaceAndn = (str) => {
    return str.replace(/\n/g, "").replace(/^\s+|\s+$|\s+(?=\s)/g, "");
  }

  consoleLogWithColor = (obj) => {

    console.log(
        util.inspect(obj, {showHidden: false, depth: null, colors: true}))

  }

  extractFileName = (link, SpecialCharacter = null) => {
    const arrUrlSplit = link.split("https://bookshop.org/");
    let getEnd = arrUrlSplit[1].split("/");
    let rel = getEnd[getEnd.length - 1];
    if (SpecialCharacter) {
      rel = rel.replace(SpecialCharacter, "");
    }
    return rel + ".json";
  }

  detachArrayByCurrency = (array = [], concurrency = 4) => {
    let newArr = [];
    // let concurrency = realConcurrency - 1;
    if (concurrency >= array.length) {
      concurrency = array.length;
    }
    for (let i = 0; i <= array.length - 1;
        i = (i + concurrency) >= array.length ? i + (array.length - i) : i
            + concurrency
    ) {
      let subArray = [];
      let decision = (i + concurrency) >= array.length ? i + (array.length - i)
          : i
          + concurrency;
      for (let j = i; j < decision; ++j) {
        subArray.push(array[j]);
      }
      newArr.push(subArray);
    }
    return newArr;
  }

  checkArrayDetach = () => {
    let arr = [1, 4, 5, 6, 7, 3, 4, 5, 6, 7];
    let arr2 = [1, 4, 5, 6, 7, 3, 4, 5, 6];
    let concurrency = [3,10,4,5];
    let arraytestCase = [[1, 4, 5, 6, 7, 3, 4, 5, 6, 7],[1, 4, 5, 6, 7, 3, 4, 5, 6],[1, 4, 5, 6, 7, 3, 4, 5,4],arr];
    for (let i=0;i<4;i++){
      this.testCase().process(arraytestCase[i],concurrency[i],"Test case "+i+":");
    }

  }

  testCase = () => {
    return {
      process: (arr, concurrency,msg) => {
        console.log("\n\n\n")
        console.log(msg);
        console.log(`Concurrency: ${concurrency}
                     `)
        console.log("Array default:")
        console.log(arr)
        console.log("Array after detached:")
        console.log(this.detachArrayByCurrency(
            arr, concurrency
        ))
      }
    }
  }

}

module.exports = new DataUtils();

let d = new DataUtils();
d.checkArrayDetach();
// console.log(new DataUtils().isNumber(5))
// console.log(new DataUtils().identityNumberChecker("0215632d0090"));
// console.log(new DataUtils().isAlphaOnly("sad asd lk"))
