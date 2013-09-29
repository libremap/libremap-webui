function strip(obj) {
  /* walks through the obj and removes all 'attributes' */
  var newObj = {};

  for (var key in obj) {
    if (key != 'attributes') {
      var type = typeof(obj[key]);
      if (type == 'object') {
        newObj[key] = strip(obj[key]);
      } else if (type == 'array') {
        newObj[key] = [];
        for (var i=0, cur; cur=obj[key][i++];) {
          if (typeof(cur)=='object') {
            cur = strip(cur);
          }
          newObj[key].push(cur);
        }
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  return newObj;
}
exports.strip = strip;

exports.router_coords = function(doc) {
  return {type: 'Point', coordinates: [doc.location.lon, doc.location.lat]};
}
