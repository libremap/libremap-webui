function(doc) {
  if (doc.collection == 'zones' && doc.network_id) {
      emit([doc.network_id, doc.name], doc);
  }
}
