var Backbone = require('backbone');
var L = require('leaflet');

/* Link.
 * attributes:
  type,
  alias1,
  alias2,
  routerId1,
  routerId2,
  routerModel1,
  routerModel2,
  quality1,  quality as seen from router1
  quality2,  quality as seen from router2 (may be undefined)
  attributes1, (may be undefined)
  attributes2 (may be undefined)
*/
module.exports = Backbone.Model.extend({
  getDistance: function() {
    var router1 = this.get('routerModel1');
    var router2 = this.get('routerModel2');
    var latlng1 = L.latLng([router1.get('lat'), router1.get('lon')]);
    var latlng2 = L.latLng([router2.get('lat'), router2.get('lon')]);
    return latlng1.distanceTo(latlng2);
  }
});
