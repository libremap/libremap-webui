function(doc, req){
  var common = require('views/lib/common');

  var parameters = JSON.parse(req.body);

  // sanitize input
  if (!common.assertArray(parameters.ids)) {
    parameters.ids = [];
  };
  if (!common.assertBbox(parameters.bbox)) {
    parameters.bbox = [0,0,0,0];
  };

  if (parameters.ids.indexOf(doc._id)>=0 ||
      doc.type=="router" &&
      common.isInBbox(doc.location.lat, doc.location.lon, parameters.bbox)) {
    return true;
  }

  return false;
}
