function map(doc) {
  if (doc.type=='router') {
    emit(
        {type: 'Point', coordinates: [ doc.location.lon, doc.location.lat]},
        doc
        );
  }
}
