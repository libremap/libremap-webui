function(doc) {
  if (doc.type=='router') {
    var site = doc.site ? doc.site : doc.hostname;
    emit(site, doc);
  }
}
