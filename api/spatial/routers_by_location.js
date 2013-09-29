function map(doc) {
  var common = require('views/lib/common');
  if (doc.type=='router') {
    emit(common.router_coords(doc), common.strip(doc));
  }
}
