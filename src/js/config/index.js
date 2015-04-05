'use strict';

module.exports = function(app) {
  app.constant('config', require('../../../config.json'));
  require('./routes')(app);
};
