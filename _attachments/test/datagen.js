var CENTER_COORDS = {
  'lat': -31.803275545018444,
  'lon': -64.43404197692871
}

var randomString = function() {
  var result = [];
  strLength = 13;
  charSet = 'ABCDEF0123456789';
  while (--strLength) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return result.join('');
}

var randomMAC = function() {
  return randomString().match(/.{2}/g).join(':');
}

var randomCoords = function(coords) {
  coords = coords || CENTER_COORDS;
  lon_str = coords.lon.toString();
  lat_str = coords.lat.toString();
  lon_base = lon_str.slice(0, lon_str.indexOf('.')+3);
  lat_base = lat_str.slice(0, lat_str.indexOf('.')+3);
  lon_variation = Math.floor(Math.random()*8999999+1000000).toString();
  lat_variation = Math.floor(Math.random()*8999999+1000000).toString();
  rand_lon = parseFloat(lon_base+lon_variation);
  rand_lat = parseFloat(lat_base+lat_variation);
  coords = {lon: rand_lon, lat: rand_lat}
  return coords
}

var DataGen = {
  generateNetwork: function(attrs){
    attrs = attrs || {}
    network_name = attrs.name || randomString()+'Libre';
    completed_attrs = {
      _id: _.uniqueId('network_').toString(),
      name: network_name,
    }
    if(attrs.coords != undefined){
      completed_attrs.coords = attrs.coords
    }
    net = new AlterMap.Network(completed_attrs)
    net.save()
    return net;
  },

  generateZone: function(name){
    zone_name = name || '';
    network = this.generateNetwork();
    zone = new AlterMap.Zone({
      _id: _.uniqueId('zone_').toString(),
      name: zone_name,
      network_id: network.get('_id'),
    });
    zone.save()
    return zone;
  },

  generateNode: function(attrs){
    attrs = attrs || {};
    coords = attrs.coords || randomCoords();
    node_name = attrs.name || randomString()+'_node';
    zone = this.generateZone();
    completed_attrs = {
      _id: _.uniqueId('node_').toString(),
      name: node_name,
      coords: coords,
      elevation: 50,
      zone_id: zone.get('_id'),
    }
    node = new AlterMap.Node(completed_attrs);
    node.save()
    return node;
  },

  generateDevice: function(){
    node = this.generateNode();
    device = new AlterMap.Device({
      _id: _.uniqueId('device_').toString(),
      node_id: node.get('_id'),
    });
    device.save()
    return device;
  },

  generateInterface: function(){
    device = this.generateDevice();
    interface = new AlterMap.Interface({
      _id: _.uniqueId('interface_').toString(),
      name: 'wlan0',
      phydev: 'phy0',
      macaddr: randomMAC(),
      mode: 'adhoc',
      medium: 'wireless',
      device_id: device.get('_id'),
    });
    interface.save()
    return interface;
  },

  generateWifiLink: function(attrs){
    wifilink = new AlterMap.WifiLink({
      _id: _.uniqueId('wifilink_').toString(),
      macaddr: attrs.macaddr,
      station: attrs.station,
      attributes: { signal: -67, channel: 11 }
    });
    wifilink.save()
    return wifilink;
  },


}
