const logger = require("./logger");
const path = require("path");
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
  isValidDAte(date){
    const reg = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
    return reg.test(date)
  }
}

module.exports = new DataUtils();

// console.log(new DataUtils().isNumber(5))
// console.log(new DataUtils().identityNumberChecker("0215632d0090"));
// console.log(new DataUtils().isAlphaOnly("sad asd lk"))
