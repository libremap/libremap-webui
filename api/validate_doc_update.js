function validate(newDoc, oldDoc, userCtx, secObj) {
  // validation according to
  // https://github.com/libre-mesh/libremap/blob/master/doc-api.md

  function exists(field, base) {
    var base = base ? base : newDoc;
    return base.hasOwnProperty(field);
  }

  function required(field, base, message) {
    if (!exists(field, base)) {
      throw({forbidden: message || "Document must have a " + field + base});
    }
  }

  function unchanged(field) {
    if (oldDoc && toJSON(oldDoc[field]) != toJSON(newDoc[field])) {
      throw({forbidden: "Field can't be changed: " + field});
    }
  }

  function isType(type, field, base) {
    var base = base ? base : newDoc;
    if (typeof(base[field]) != type) {
      throw({forbidden: "Field must be a "+type+": " + field});
    }
  }

  function isNumber(field, base) {
    isType("number", field, base);
  }

  function isString(field, base) {
    isType("string", field, base);
  }

  function isObject(field, base) {
    isType("object", field, base);
  }

  function isVersionString(field, base) {
    var base = base ? base : newDoc;
    isString(field, base);
    // TODO
  }

  // tests if the field is a valid date
  // by checking invariance under ( new Date(...) ).toISOString()
  function isDate(field, base, message) {
    var base = base ? base : newDoc;
    var date = (new Date(base[field])).toISOString();
    if (base[field] != date) {
      throw({forbidden: (message || "Field "+field+" has to be invariant under (new Date(...)).toISOString() (evaluates to "+date+")") });
    }
    return date;
  }

  function user_is(role) {
    return userCtx.roles.indexOf(role) >= 0;
  }

  if (newDoc._deleted) {
    if (user_is('_admin')) {
      return;
    } else {
      throw({forbidden: 'Only admins are allowed to delete docs.'});
    }
  }

  required('api_rev');
  isVersionString('api_rev');

  required('type');
  isString('type');

  if (newDoc.type == 'router') {
    required('hostname');
    isString('hostname');

    required('ctime');
    unchanged('ctime');
    var ctime = isDate('ctime');
    var compare_time = (new Date( (new Date()).getTime() + 5*60*1000 )).toISOString();
    if (ctime > compare_time) {
      throw({forbidden: 'future dates not allowed in field ctime: ' + newDoc['ctime']})
    }

    required('mtime');
    var mtime = isDate('mtime');
    if (mtime > compare_time) {
      throw({forbidden: 'future dates not allowed in field mtime: ' + newDoc['mtime']})
    }
    if (mtime < ctime) {
      throw({forbidden: 'mtime < ctime not allowed'});
    }

    required('location');
    isObject('location');

    required('lat', newDoc['location']);
    isNumber('lat', newDoc['location']);
    if (newDoc['location']['lat'] < -180 || newDoc['location']['lat'] > 180) {
      throw({forbidden: 'invalid range: longitude should be between -180 and 180'});
    }

    required('lon', newDoc['location']);
    isNumber('lon', newDoc['location']);
    if (newDoc['location']['lon'] < -90 || newDoc['location']['lon'] > 90) {
      throw({forbidden: 'invalid range: longitude should be between -90 and 90'});
    }

    if (exists('elev', newDoc['location'])) {
      isNumber('elev', newDoc['location']);
    }

    if (exists('aliases')) {
      isObject('aliases');
      for (var alias in newDoc['aliases']) {
        var aliasobj = newDoc['aliases'][alias];
        required('type', aliasobj);
        isString('type', aliasobj);
      }
    }

    if (exists('links')) {
      isObject('links');
      for (var link in newDoc['links']) {
        var linkobj = newDoc['links'][link];
        if (exists('type', linkobj)) {
          isString('type', linkobj);
        }
        if (exists('quality', linkobj)) {
          isNumber('quality', linkobj);
          var quality = linkobj['quality'];
          if (quality<0 || quality>1) {
            throw({forbidden: 'invalid range: link quality should be between 0 and 1'});
          }
        }
        if (exists('attributes', linkobj)) {
          isObject('attributes', linkobj);
        }
      }
    }

    if (exists('site')) {
      isString('site');
    }

    if (exists('community')) {
      isString('community');
    }

    if (exists('attributes')) {
      isObject('attributes');
    }
  } else {
    throw({forbidden: 'unrecognized type: ' + newDoc.type});
  }
}
