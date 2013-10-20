var LinkBboxCollection = require('libremap-backbone/collections/linksBbox');
var config = require('../../../config.json');

module.exports = LinkBboxCollection.extend({
  url: config.api_url + '/routers_by_location_stripped',
  byAliasUrl: config.api_url + '/routers_by_alias_stripped',
  changesUrl: config.api_url + '/changes',
  changesFilter: 'libremap-api/by_id_or_bbox',
});
