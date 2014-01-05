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
  },
  getQuality: function() {
    var router1 = this.get('routerModel1');
    var router2 = this.get('routerModel2');
    var quality1 = this.get('quality1');
    var quality2 = this.get('quality2');
    if (quality1 && quality2) {
      return router1.get('mtime')<router2.get('mtime') ? quality2 : quality1;
    }
    return quality1 ? quality1 : quality2;
  }
});
