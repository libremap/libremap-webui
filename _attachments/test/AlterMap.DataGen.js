
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

  generateCommunity: function(attrs){
    var attrs = attrs || {};
    var id = attrs.id || _.uniqueId('community_').toString();
    var name = attrs.name || this._randomString()+'Libre';
    var coords = attrs.coords || this.default_coords;
    var completed_attrs = {
      _id: id,
      name: name,
      coords: coords
    }
    var community = new AlterMap.Community(completed_attrs);
    this._save(community);
    return community;
  },

  _newRouter: function(attrs){
    var coords = attrs.coords || this._randomCoords();
    var hostname = attrs.hostname || this._randomString()+'_router';
    var community = attrs.community || this.generateCommunity().get('name');
    var node = attrs.node || hostname
    var router = {
      _id: _.uniqueId('router_').toString(),
      hostname: hostname,
      coords: coords,
      elevation: 50,
      community: community,
      node: node
    }    
    return router;
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

  _newWifiLink: function(attrs){
    if (attrs.local_mac==undefined || attrs.station_mac==undefined){
      throw ('_newWifiLink: missing local macaddress or station macaddress');
    }
    if (attrs.local_mac == attrs.station_mac){
      throw ('_newWifiLink: local and station macaddress cannot be the same');
    }
    var wifilink = {
      type: "wifi", 
      attributes: {
        local_mac: attrs.local_mac,
        station_mac: attrs.station_mac,
        channel: 4,
        signal: this._randomSignal()
      }
    }
    return wifilink
  },


  generateRouter: function(attrs){
    var attrs = attrs || {};
    completed_attrs = this._newRouter(attrs);
    var router = new AlterMap.Router(completed_attrs);
    this._save(router);
    return router;
  },

  _newFullRouter: function(attrs){
    var attrs = attrs || {};
    var completed_attrs = this._newRouter(attrs);
    var router = new AlterMap.Router(completed_attrs);
    var iface = this._newInterface();
    router.set({'interfaces': [iface]})
    return router
  },

  addInterface: function(router){
    var iface = this._newInterface();
    var interfaces = router.get('interfaces')
    if (interfaces == undefined){
      router.set({'interfaces': [iface]});
    }
    else {
      interfaces.push(iface);
      router.set({'interfaces': interfaces});
    }
    this._save(router);
    return iface
  },

  addWifiLink: function(router, attrs){
    var wifilink = this._newWifiLink(attrs)
    var links = router.get('links')
    if (links == undefined){
      router.set({'links': [wifilink]});
    }
    else {
      links.push(wifilink);
      router.set({'links': links});
    }
    this._save(router);
    return wifilink;
  },

  linkRouters: function(local_router, station_router){
  // generates reciprocal links between the first interface of two given routers
    local_mac = local_router.get('interfaces')[0].macaddr;
    station_mac = station_router.get('interfaces')[0].macaddr;
    this.addWifiLink(local_router, {local_mac: local_mac, station_mac: station_mac});
    this.addWifiLink(station_router, {local_mac: station_mac, station_mac: local_mac});
  },

  generateFixture: function(attrs){
    var router_count = attrs.router_count || 10;
    var communities = new AlterMap.CommunityCollection();
    var routers = new AlterMap.RouterCollection();
    var wifilinks = [];

    var community = this.generateCommunity();
    communities.add(community);

    var curr_iface, prev_iface, router;

    for (var i=0; i<router_count; i++){
      router = this._newFullRouter({community: community.get('name')});
      curr_iface = router.get('interfaces')[0];
      if (i>=1){
        prev_router = routers.at(i-1);
        prev_iface = prev_router.get('interfaces')[0];
        wifilink = this._newWifiLink({local_mac: curr_iface['macaddr'], station_mac: prev_iface['macaddr']});
        wifilinks.push(wifilink);
        router.set({'links': [wifilink]});
      }
      router.save();
      routers.add(router);
    }
    return {communities: communities, routers: routers, wifilinks: wifilinks};
  },
}
