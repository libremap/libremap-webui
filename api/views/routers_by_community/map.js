function(doc) {
  if (doc.type=='router' && doc.community) {
    emit(doc.community, doc);
  }
}
