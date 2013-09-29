function(doc) {
  if (doc.type=='router') {
    emit(doc.community, 1);
  }
}
