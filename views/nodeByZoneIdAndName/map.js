function(doc) {
  if (doc.collection == 'nodes' && doc.zone_id && doc.name) {
      emit([doc.zone_id, doc.name], doc);
  }
}
