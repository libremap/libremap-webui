function(doc) {
  if (doc.type=='router') {
    emit(doc._id, doc);
  }
}
