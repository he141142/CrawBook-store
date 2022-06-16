const CoreService = require("./core-services");
module.exports = class BaseService extends CoreService {
  _include = null;
  _model = null;
  constructor(model, include) {
    super();
    if (!model || !include) {
      // logger.warn("model may not set");
    }
    this._include = include;
    this._model = model;
  }
};


