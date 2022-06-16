const express = require("express");
const Router = express.Router;
const logger = require("../../utils/logger");
const CustomResponse = require("../../Middleware/response");
const axios = require("axios");
const cheerio = require("cheerio");

// const { body, checkSchema, validationResult } = require("express-validator");

module.exports = class BaseRouter extends Router {
  _service = null;
  //-------------for validate--------------//
  // _body = body;
  // _checkSchema = checkSchema;
  // _validationResult = validationResult;
  //--------------------------------------//
  constructor(service) {
    super();
    if (!service) {
      logger.warn("Service have not been initialized!");
    }
    this._service = service;
    // this.get("/get-base", this.serverRunSuccessfully());
  }

  // serverRunSuccessfully =  (req, res,next) => {
  //   CustomResponse.sendObject(res, 200, {
  //     message: "Server run successfully!"
  //   });
  //
  // }

   baseAxiosCheerio= function (cherio,url,functionInterface,req,res){
    axios.get(url).then(({data}) => {
      const dollar = cheerio.load(data); // Initialize cheerio
      const links = functionInterface.apply(dollar);
      console.log(links);
      CustomResponse.sendObject(res, 200, {
            response: links
          }
      );
      // ['https://scrapeme.live/shop/page/2/', 'https://scrapeme.live/shop/page/3/', ... ]
    });
  }

  authorize = {
    form: {
      ROUTER: "/form",
      createForm: {
        URL: "/api/form/create",
        METHOD: "/post",
      },
      managerComment: {
        URL: "/api/form//modify/comment",
        METHOD: "/patch",
      },
      viewIntern: {
        URL: "/api/form/list/intern",
        METHOD: "/get",
      },
      viewEvaluate: {
        URL: "/api/form/list/evaluate",
        METHOD: "/get",
      },
      approveAction: {
        URL: "/api/form/approve",
        METHOD: "/put",
      },
      rejectAction: {
        URL: "/api/form/reject",
        METHOD: "/put",
      },
      checkDue: {
        URL: "/api/form/checkDue",
        METHOD: "/patch",
      },
      closeForm: {
        URL: "/api/form/close",
        METHOD: "/patch",
      }
    },
    user: {
      ROUTER: "/user",
      addEmployee: {
        URL: "/api/user/addEmployee",
        METHOD: "/post",
      },
      viewOwnEmployee: {
        URL: "/api/user/ViewOwnEmployees",
        METHOD: "/get",
      },
      viewAllEmployee: {
        URL: "/api/user/displayEmployeeList",
        METHOD: "/get",
      },
    },
  };
};
