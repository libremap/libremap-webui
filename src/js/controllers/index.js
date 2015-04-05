'use strict';
module.exports = function(app) {
  require('./map')(app);
  require('./nav')(app);
};
