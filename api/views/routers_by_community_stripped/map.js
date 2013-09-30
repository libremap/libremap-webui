function(doc) {
  var common = require('views/lib/common');
  if (doc.type=='router' && doc.community) {
    emit(doc.community, common.strip(doc));
  }
}
