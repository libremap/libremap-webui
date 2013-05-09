
AlterMap.DataGen = {

  default_coords: {
    'lat': -31.803275545018444,
    'lon': -64.43404197692871
  },

  PERSIST: false,

  _randomString: function() {
    var result = [];
    var strLength = 13;
    var charSet = 'ABCDEF0123456789';
    while (--strLength) {
      result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    }
    return result.join('');
  },

  _save: function(model_instance){
    if(this.PERSIST==true){
      model_instance.save()
    }
  },

  _randomCoords: function(coords) {
    var coords = coords || this.default_coords;
    var lon_str = coords.lon.toString();
    var lat_str = coords.lat.toString();
    var lon_base = lon_str.slice(0, lon_str.indexOf('.')+3);
    var lat_base = lat_str.slice(0, lat_str.indexOf('.')+3);
    var lon_variation = Math.floor(Math.random()*8999999+1000000).toString();
    var lat_variation = Math.floor(Math.random()*8999999+1000000).toString();
    var rand_lon = parseFloat(lon_base+lon_variation);
    var rand_lat = parseFloat(lat_base+lat_variation);
    var coords = {lon: rand_lon, lat: rand_lat};
    return coords
  },

  _randomSignal: function(){
    return -Math.floor(Math.random()*100)
  },

  
  randomMAC: function() {
    return this._randomString().match(/.{2}/g).join(':');
  },

  generateNetwork: function(attrs){
    var attrs = attrs || {};
    var id = attrs.id || _.uniqueId('network_').toString();
    var network_name = attrs.name || this._randomString()+'Libre';
    var coords = attrs.coords || this.default_coords;
    var completed_attrs = {
      _id: id,
      name: network_name,
      coords: coords
    }
    var network = new AlterMap.Network(completed_attrs);
    this._save(network);
    return network;
  },

  _newNode: function(attrs){
    var coords = attrs.coords || this._randomCoords();
    var node_name = attrs.name || this._randomString()+'_node';
    var network_id = attrs.network_id || this.generateNetwork().id;
    var node = {
      _id: _.uniqueId('node_').toString(),
      name: node_name,
      coords: coords,
      elevation: 50,
      network_id: network_id,
    }    
    return node;
  },

  _newInterface: function(){
    var iface = {name: 'wlan0',
                 phydev: 'phy0',
                 macaddr: this.randomMAC(),
                 mode: 'adhoc',
                 medium: 'wireless',
                }
    return iface
  },

  _newDevice: function(node, attrs){
    var attrs = attrs || {};
    var hostname = attrs.hostname || node.get('name')+'--'+ this._randomString();
    var iface = this._newInterface();
    var device = {'hostname': hostname,
                  'interfaces': [iface]
                 }
    return device
  },

  generateNode: function(attrs){
    var attrs = attrs || {};
    completed_attrs = this._newNode(attrs);
    var node = new AlterMap.Node(completed_attrs);
    this._save(node);
    return node;
  },

  addDevice: function(node, attrs){
    var attrs = attrs || {};
    var device = this._newDevice(node, attrs);
    var devices = node.get('devices')
    if (devices == undefined){
      node.set({'devices': [device]});
    }
    else {
      devices.push(device);
      node.set({'devices': devices});
    }
    this._save(node);
    return device
  },

  generateFullNode: function(attrs){
  // this method exists separately because calling generateNode and addDevice one after the other results in a couchdb conflict.
    var attrs = attrs || {};
    var completed_attrs = this._newNode(attrs);
    var node = new AlterMap.Node(completed_attrs);
    var device = this._newDevice(node);
    node.set({'devices': [device]})
    this._save(node);
    return node;
  },

  generateWifiLink: function(attrs){
    if (attrs.macaddr==undefined || attrs.station==undefined){
      throw ('generateWifiLink: missing macaddr or station');
    }
    if (attrs.macaddr == attrs.station){
      throw ('generateWifiLink: macaddr and station cannot be the same');
    }
    var wifilink = new AlterMap.WifiLink({
      _id: _.uniqueId('wifilink_').toString(),
      macaddr: attrs.macaddr,
      station: attrs.station,
      attributes: { signal: this._randomSignal(), channel: 11 }
    });
    this._save(wifilink);
    return wifilink;
  },

  generateFixture: function(attrs){
    var node_count = attrs.node_count || 10;

    var networks = new AlterMap.NetworkCollection();
    var nodes = new AlterMap.NodeCollection();
    var devices = [];
    var wifilinks = new AlterMap.WifiLinkCollection();

    var network = this.generateNetwork();
    networks.add(network);

    var curr_device, prev_device, curr_iface, prev_iface, node;

    for (var i=1; i<=node_count; i++){
      node = this.generateFullNode({network_id: network.id});
      curr_device = node.get('devices')[0];
      devices.push(curr_device);
      curr_iface = curr_device.interfaces[0];
      if (i>1){
        prev_device = devices.slice(-2,-1)[0]
        prev_iface = prev_device.interfaces[0];
        var wifilink = this.generateWifiLink({
          macaddr: prev_iface['macaddr'],
          station: curr_iface['macaddr']
        });
        wifilinks.add(wifilink);        
      }
      nodes.add(node);
    }
    return {networks: networks, nodes: nodes, wifilinks: wifilinks};
  },
}
