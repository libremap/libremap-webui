function(doc) {
  if (doc.collection == 'interfaces' && doc.device_id) {
      emit(doc.device_id, doc);
  }
}
