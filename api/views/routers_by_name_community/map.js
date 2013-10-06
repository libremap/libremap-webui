function(doc) {
  if (doc.type=='router' && doc.community) {
    emit([doc.hostname,doc.community], doc);
  }
}
