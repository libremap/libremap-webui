
LibreMap.DataGen = {

  default_location: {
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

  _randomLocation: function(location) {
    var location = location || this.default_location;
    var lon_str = location.lon.toString();
    var lat_str = location.lat.toString();
    var lon_base = lon_str.slice(0, lon_str.indexOf('.')+3);
    var lat_base = lat_str.slice(0, lat_str.indexOf('.')+3);
    var lon_variation = Math.floor(Math.random()*8999999+1000000).toString();
    var lat_variation = Math.floor(Math.random()*8999999+1000000).toString();
    var rand_lon = parseFloat(lon_base+lon_variation);
    var rand_lat = parseFloat(lat_base+lat_variation);
    var elev = 10;
    var location = {lon: rand_lon, lat: rand_lat, elev: elev};
    return location
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
    var location = attrs.location || this.default_location;
    var completed_attrs = {
      _id: id,
      name: name,
      location: location
    }
    var community = new LibreMap.Community(completed_attrs);
    this._save(community);
    return community;
  },

  _newRouter: function(attrs){
// should generate valid router data structure as described in:
// https://github.com/libre-mesh/libremap/blob/master/doc-api.md 
    var location = attrs.location || this._randomLocation();
    var hostname = attrs.hostname || this._randomString()+'_router';
    var community = attrs.community || this.generateCommunity().get('name');
    var site = attrs.site || hostname
    var ctime = attrs.ctime || new Date().toISOString();
    var mtime = attrs.mtime || new Date().toISOString();
    var router = {
      // we generate the _id to have consistance between PERSIST true and false
      _id: _.uniqueId('router_').toString(),
      api_rev: "1.0",
      type: "router",
      hostname: hostname,
      ctime: ctime,
      mtime: mtime,
      location: location,
      community: community,
      site: site
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
    var wifiLink = {
      alias: attrs.station_mac,
      type: "wifi",
      quality: 0.5,
      attributes: {
        interface: "wlan1",
        channel: 4,
        signal: this._randomSignal()
      }
    }
    return wifiLink
  },

  generateRouter: function(attrs){
    var attrs = attrs || {};
    completed_attrs = this._newRouter(attrs);
    var router = new LibreMap.Router(completed_attrs);
    this._save(router);
    return router;
  },

  _newFullRouter: function(attrs){
    var attrs = attrs || {};
    var completed_attrs = this._newRouter(attrs);
    var router = new LibreMap.Router(completed_attrs);
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
    this.addWifiLink(local_router, {station_mac: station_mac});
    this.addWifiLink(station_router, {station_mac: local_mac});
  },

  generateFixture: function(attrs){
    var router_count = attrs.router_count || 10;
    var communities = new LibreMap.CommunityCollection();
    var routers = new LibreMap.RouterCollection();
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
        wifilink = this._newWifiLink({station_mac: prev_iface['macaddr']});
        wifilinks.push(wifilink);
        router.set({'links': [wifilink]});
      }
      router.save();
      routers.add(router);
    }
    return {communities: communities, routers: routers, wifilinks: wifilinks};
  },
}
