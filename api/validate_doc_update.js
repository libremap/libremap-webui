function validate(newDoc, oldDoc, userCtx, secObj) {
  // validation according to
  // https://github.com/libre-mesh/libremap/blob/master/doc-api.md

  var common = require('views/lib/common');

  function err(msg) {
    throw({forbidden: msg});
  }

  function required(obj, key) {
    if (!key) {
      key = obj;
      obj = newDoc;
    }
    if (!common.exists(obj, key)) {
      err("key is required in object: " + key);
    }
  }

  function unchanged(key) {
    if (oldDoc && toJSON(oldDoc[key]) != toJSON(newDoc[key])) {
      err("key can't be changed: " + key);
    }
  }

  function user_is(role) {
    return userCtx.roles.indexOf(role) >= 0;
  }

  if (newDoc._deleted) {
    if (user_is('_admin')) {
      return;
    } else {
      err('Only admins are allowed to delete docs.');
    }
  }

  required('api_rev');
  common.assertVersionString(newDoc.api_rev, err);

  required('type');
  common.assertString(newDoc.type, err);

  if (newDoc.type == 'router') {
    required('hostname');
    common.assertString(newDoc.hostname, err);

    required('ctime');
    unchanged('ctime');
    var ctime = newDoc.ctime;
    common.assertDate(ctime, err);
    var compare_time = (new Date( (new Date()).getTime() + 5*60*1000 )).toISOString();
    if (ctime > compare_time) {
      err('future dates not allowed in field ctime: ' + newDoc['ctime']);
    }

    required('mtime');
    var mtime = newDoc.mtime;
    common.assertDate(mtime, err);
    if (mtime > compare_time) {
      err('future dates not allowed in field mtime: ' + newDoc['mtime']);
    }
    if (mtime < ctime) {
      err('mtime < ctime not allowed');
    }

    required('location');
    common.assertObject(newDoc.location, err);

    required(newDoc.location, 'lat');
    common.assertNumber(newDoc.location.lat, err);
    if (newDoc.location.lat < -90 || newDoc.location.lat > 90) {
      err('invalid range: longitude should be between -90 and 90');
    }

    required(newDoc.location, 'lon');
    common.assertNumber(newDoc.location.lon, err);
    if (newDoc.location.lon < -180 || newDoc.location.lon > 180) {
      err('invalid range: longitude should be between -180 and 180');
    }

    if (common.exists(newDoc.location, 'elev')) {
      common.assertNumber(newDoc.location.elev, err);
    }

    if (common.exists('aliases')) {
      common.assertArray(newDoc.aliases, err);
      for (var i=0, alias; alias=newDoc['aliases'][i++];) {
        required(alias, 'alias');
        common.assertString(alias.alias, err);
        if (common.exists(alias, 'type')) {
          common.assertString(alias.type, err);
        }
      }
    }

    if (common.exists('links')) {
      common.assertArray(newDoc.links, err);
      for (var i=0, link; link=newDoc['links'][i++];) {
        required(link, 'alias');
        common.assertString(link.alias, err);
        if (common.exists(link, 'type')) {
          common.assertString(link.type);
        }
        if (common.exists(link, 'quality')) {
          common.assertNumber(link.quality, err);
          var quality = link.quality;
          if (quality<0 || quality>1) {
            err('invalid range: link quality should be between 0 and 1');
          }
        }
        if (common.exists(link, 'attributes')) {
          common.assertObject(link.attributes, err);
        }
      }
    }

    if (common.exists('site')) {
      common.assertString(newDoc.site, err);
    }

    if (common.exists('community')) {
      common.assertString(newDoc.community, err);
    }

    if (common.exists('attributes')) {
      common.assertObject(newDoc.attributes, err);
    }
  } else {
    err('unrecognized type: ' + newDoc.type);
  }
}
