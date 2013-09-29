function(doc) {
  var common = require('views/lib/common');
  if (doc.type=='router') {
    var site = doc.site ? doc.site : doc.hostname;
    emit(site, common.strip(doc));
  }
}
