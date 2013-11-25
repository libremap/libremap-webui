var Backbone = require('backbone');

module.exports = {
  type: 'dataLayer',
  model: Backbone.Model,
  view: require('./views/libremap'),
  controlView: require('./views/control')
};
