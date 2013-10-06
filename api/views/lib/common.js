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

exports.exists = function(obj, key) {
  return obj.hasOwnProperty(key);
}

exports.assertType = function(v, type, err) {
  if (typeof(v) != type) {
    err(type+' expected: '+v);
  }
}

exports.assertNumber = function (v, err) {
  return exports.assertType(v, "number", err);
}

exports.assertString = function (v, err) {
  return exports.assertType(v, "string", err);
}

exports.assertObject = function (v, err) {
  return exports.assertType(v, "object", err);
}

exports.assertArray = function (v, err) {
  if (Object.prototype.toString.call(v) !== '[object Array]') {
    err('Array expected: '+v);
  }
}

exports.assertVersionString = function(v, err) {
  exports.assertString(v, err);
  // TODO
}

// tests if the field is a valid date
// by checking invariance under ( new Date(...) ).toISOString()
exports.assertDate = function(v, err) {
  var date = (new Date(v)).toISOString();
  if (v != date) {
    err("Date expected: "+v);
  }
}

exports.getDate = function () {
  return (new Date()).toISOString();
}

exports.isInBbox = function (lat, lon, bbox) {
  exports.assertArray(bbox, function () {
    bbox = [0,0,0,0];
  });
}
