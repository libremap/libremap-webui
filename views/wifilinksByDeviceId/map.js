function(doc) {
  if (doc.collection == 'wifilinks' && doc.device_id) {
      emit(doc.device_id, doc);
  }
}
