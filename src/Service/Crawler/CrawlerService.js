const BaseService = require('../base/base-services');

module.exports = class CrawlerService extends BaseService {
  _model = null;
  _include = [];
  constructor() {
    super("ex",[]);
  }
}