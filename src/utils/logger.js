

const { createLogger, transports } = require("winston");

const winston = require("winston");
const util = require("util");
const config = require("../config/config");
const format = require("winston").format;
// require("winston-daily-rotate-file");

const directory = config.log_directory || "logs";
// const filename = config.log_file_name || `${config.name}.${config.env}`;

const myCustomLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "grey",
    verbose: "cyan",
    debug: "blue",
    silly: "magenta",
  },
};

// if (!fs.existsSync(directory)) {
//   fs.mkdirSync(directory);
// }

const formatLevel = format((info) => {
  info.level = info.level.toUpperCase().padEnd(7, "-");
  return info;
});

const formatStack = format((info) => {
  if (info.stack) {
    info.message = util.format(info.message, "\n [errorx64]", info.stack);
  }
  return info;
});

const formatOutput = format.printf((info) => {
  info.message =
      typeof info.message === "object"
          ? JSON.stringify(info.message, null, 3)
          : info.message;
  return `[${info.timestamp}] ${info.level} :> ${info.message || ""}`;
});

const logger = createLogger({
  levels: myCustomLevels.levels, //custom lever
  level: "info", //default info
  timestamp: true,
  format: format.combine(format.errors({ stack: "true" }), format.timestamp()),
  transports: [
    new transports.Console({
      format: format.combine(
          formatLevel(),
          formatStack(),
          format.colorize({
            all: true,
          }),
          formatOutput
      ),
    }),
  ],
});

winston.addColors(myCustomLevels.colors);

module.exports = logger;
