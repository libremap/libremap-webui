function (doc, req) {
  var common = require('views/lib/common');

  var newdoc = JSON.parse(req.body);

  function err(msg) {
    return [null, toJSON({'error': msg})];
  }
  
  // update document
  if (doc && (req.method=="POST" || req.method=="PUT")) {
    // TODO

  } else if (doc && (req.method=="DELETE")) {
    // TODO

  // create document (doc does not exist)
  } else if (req.method=="POST") {
    // check id
    if (req.id && req.id!=newdoc._id) {
      return err('id mismatch');
    }
    if (!newdoc._id) {
      newdoc._id = req.uuid;
    }

    if (newdoc.type != 'router') {
      return err('type!=router');
    }
    return [newdoc, toJSON({'ok': true, "id": newdoc._id})];

  // fail
  } else {
    return err('method '+req.method+' not handled.');
  }

  return err('update handler failed, is this a bug?');
}
