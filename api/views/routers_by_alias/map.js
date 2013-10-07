function(doc) {
  if (doc.type=='router') {
    if (doc.aliases) {
      for (var i=0, alias; alias=doc.aliases[i++];) {
        emit({ "alias": alias.alias, "type": alias.type}, doc);
      }
    }
  }
}
