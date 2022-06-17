const dotenv = require("dotenv");
const path = require("path");
// Load environment constiables from .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });
const env = process.env.NODE_ENV;

const configs = {
  base: {
    env,
    // Application
    name: process.env.APP_NAME || "SEQUELIZE_REMASTER",
    host: process.env.HTTP_HOST || "localhost",
    port: process.env.HTTP_PORT || 8002,
    // Database
    db_host: process.env.DB_HOST || "localhost",
    db_port: process.env.DB_PORT || 3306,
    db_dialect: process.env.DB_DIALECT || "mysql",
    db_username: process.env.DB_USERNAME || "root",
    db_password: process.env.DB_PASSWORD || "1222",
    db_database: process.env.DB_DATABASE || "nodejsmysql",
    force_reset: false,
    // Security
    token_secret: process.env.TOKEN_SECRET || "TEST-DEV-SECRET",
    //paging
    pageLimit: 5,
    defautltSort: process.env.DEFAULT_SORT || "DESC",
    //crawler
    CRAW_HOST: process.env.CRAW_HOST,
    CRAW_PORT: process.env.CRAW_PORT,
    CRAW_PROTOCOL: process.env.CRAW_PROTOCOL,
    DEFAULT_NAVIGATION_TIMEOUT: process.env.DEFAULT_NAVIGATION_TIMEOUT,
    HTTP_HEADER_REFERRER: process.env.HTTP_HEADER_REFERRER,
    EXECUTABLE_PART:process.env.EXECUTABLE_PART
  },
};

const config = Object.assign(configs.base);

module.exports = config;