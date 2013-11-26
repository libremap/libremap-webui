var Backbone = require('backbone');

module.exports = {
  type: 'dataLayer',
  model: require('./models/libremap'),
  view: require('./views/libremap'),
  controlView: require('./views/control')
};
