const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const logger = require("../src/utils/logger");
const config = require("../src/config/config");
const InitialService = require("../src/Service/index");
const { responseEnhancer } = require("express-response-formatter");
var cors = require('cors')
const CustomResponse = require("./Middleware/response")
// let { InitAssociationData } = require("./_seeder/index");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(responseEnhancer());
app.use(cors());

app.get("/getBook", (req, res, next) => {
  res.send("haha");
});

app.get("/", (req, res) => CustomResponse.sendObject(res,200,"msg"));

const initService = (app) => {
  const service = new InitialService(app);
  service.registerService();

  logger.info("Initializing service...");
};

// const initSequelize = async () => {
//   const db = require("./_models/db.connect");
//   try {
//     await db.connect();
//     logger.info(`Establish connection successfully:--->`);
//   } catch (error) {
//     logger.error("Connection crashed!--->");
//     logger.error(err.message);
//   }
// };

const startServer =  (app) => {
  initService(app);
  // await initSequelize();
  app.listen(config.port, config.host);
  logger.info(
      `Listening on host ${config.host} on port ${config.port} http://${config.host}:${config.port}`
  );
};

startServer(app);

module.exports = app;