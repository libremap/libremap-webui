function(doc) {
  if (doc.collection == 'nodes' && doc.network_id) {
      emit([doc.network_id, doc.name], doc);
  }
}
