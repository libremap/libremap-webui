function(doc) {
  if (doc.collection == 'networks' && doc.name) {
      emit(doc.name, doc);
  }
}
