const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const config = require("../config/config")
//create folder if not exist
const mkdirSync = function (path) {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {recursive: true});
    }
  } catch (err) {
    throw err;
  }
};

//delete all png or jpg file in directory
const deleImageFIle = (path) => {
  try {
    let regex = /\.(png|jpg)$/;
    fs.readdirSync(path)
    .filter((f) => regex.test(f))
    .map((f) => fs.unlinkSync(path + "/" + f));
    //file removed
    return true;
  } catch (err) {
    logger.error(err);
    return false;
  }
};

const writeToFile = (fileName, data) => {
  fs.writeFile(fileName, data, (err) => {
    if (err) {
      logger.error("Cant save file");
      throw err;
    }
    logger.info("JSON data is saved.");
  });
}

const getAbsoulutePathJSONStorage = () => {
  return config.BASE_PATH + "/jsonStorage"
}

module.exports = {
  mkdirSync,
  deleImageFIle,
  writeToFile,
  getAbsoulutePathJSONStorage
};