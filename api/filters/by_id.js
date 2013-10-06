function(doc, req){
  var common = require('views/lib/common');

  var parameters = JSON.parse(req.body);

  // sanitize input
  common.assertArray(parameters.ids, function() {
    parameters.ids = [];
  });
  common.assertArray(parameters.bbox, function() {
    parameters.bbox = [];
  });

  if (parameters.ids.indexOf(doc._id)>=0) {
    return true;
  }
  /*
  // is the document part of a collection?
  if(req.query && doc.user==req.query.keys)
    return true;
  // has the document been deleted?
  else if (req.query && req.query.collection && doc._deleted)
    return true;
  else
    return false;
    */
}
