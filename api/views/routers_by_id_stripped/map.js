function(doc) {
  var common = require('views/lib/common');
  if (doc.type=='router') {
    emit(doc._id, common.strip(doc));
  }
}
