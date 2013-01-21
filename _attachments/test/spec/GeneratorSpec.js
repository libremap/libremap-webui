
describe('AlterMap test-data generator', function(){
  var test_db = "altermap_test";
  Backbone.couch_connector.config.db_name = test_db;
  Backbone.couch_connector.config.ddoc_name = test_db;
  var delete_req_settings = {async: false, url: "/"+ test_db, type: 'DELETE',
    statusCode: {
      404: function(){console.log('database already deleted or not created yet')}
    }
  }

//  $.ajax(delete_req_settings);
//  $.ajax({async: false, url: "/"+ test_db, type: 'PUT'});

  beforeEach(function(){
//    $.ajax(delete_req_settings);
    $.ajax({async: false, url: "/"+ test_db, type: 'PUT'});
  });

  afterEach(function(){
    $.ajax(delete_req_settings);
  });

  describe('Generated Network', function() {
    beforeEach(function(){
      this.network = DataGen.generateNetwork();
    });

    it('has a name', function() {
      expect(this.network.get('name')).not.toBeUndefined();
      expect(this.network.get('name')).not.toBe('');
    });
    it('does not share name with others', function(){
      network2 = DataGen.generateNetwork();
      expect(this.network.get('name')).not.toBe(network2.get('name'));
    });
    it('can be created with a given name', function(){
      net = DataGen.generateNetwork({name: 'mynet'});
      expect(net.get('name')).toBe('mynet');
    });
    it('can be created with center coordinates', function(){
      net = DataGen.generateNetwork(
        {name: 'mynet',
         coords: {lon: -64.43404197692871, lat: -31.803275545018444}
        });
      expect(net.get('coords')).toEqual(
        {lon: -64.43404197692871, lat: -31.803275545018444}
      );
    });
  });

  describe('Generated Zone', function() {
    beforeEach(function(){
      this.zone = DataGen.generateZone();
    });
    it('has a name attribute which can be empty', function(){
      expect(this.zone.get('name')).not.toBeUndefined();
    });
    it('can be created with a given name', function(){
      zone = DataGen.generateZone('myzone');
      expect(zone.get('name')).toBe('myzone');
    });
    it('is part of a network', function(){
      expect(this.zone.get('network_id')).not.toBeUndefined();
    });
  });

  describe('Generated Node', function() {
    beforeEach(function(){
      this.node = DataGen.generateNode();
    });
    it('has a name', function(){
      expect(this.node.get('name')).not.toBeUndefined();
      expect(this.node.get('name')).not.toBe('');
    });
    it('does not share name with others', function(){
      node2 = DataGen.generateNode();
      expect(this.node.get('name')).not.toBe(node2.get('name'));
    });
    it('can be created with a given name', function(){
      node = DataGen.generateNode({name: 'mynode'});
      expect(node.get('name')).toBe('mynode');
    });
    it('is part of a zone', function(){
      expect(this.node.get('zone_id')).not.toBeUndefined();
    });
    it('has a set of coordinates', function(){
      expect(this.node.get('coords')).not.toBeUndefined();
    });
    it('is near network center', function(){
      lat_diff = this.node.get('coords').lat - CENTER_COORDS.lat;
      lon_diff = this.node.get('coords').lon - CENTER_COORDS.lon;
      distance = Math.sqrt(Math.pow(2,lat_diff)+Math.pow(2,lon_diff))
      // this was an empirical value taken from nodes near map edge at zoom lvl 15
      expect(distance).toBeLessThan(1.425);
    });
    it('does not share position with others', function(){
      node2 = DataGen.generateNode();
      expect([this.node.get('coords'), this.node.get('elevation')])
        .not.toEqual([node2.get('coords'), this.node.get('elevation')]);
    });
  });

  describe('Generated Device', function() {
    beforeEach(function(){
      this.device = DataGen.generateDevice();
    });
    it('is part of a node', function(){
      expect(this.device.get('node_id')).not.toBeUndefined();
    });
  });

  describe('Generated Interface', function(){
    beforeEach(function(){
      this.interface = DataGen.generateInterface();
    });
    it('it must have a macaddr', function(){
      expect(this.interface.get('macaddr')).not.toBeUndefined()
    });
    it('does not share macaddress with others', function(){
      interface2 = DataGen.generateInterface();
      expect(this.interface.get('macaddr')).not.toEqual(interface2.get('macaddr'));
    });
  });
  describe('Generated WifiLink', function() {
    beforeEach(function(){
      this.wifilink = DataGen.generateWifiLink({macaddr: randomMAC(), station: randomMAC()});
    });
    it('can be created with a given macaddr/station pair', function(){
      expect(this.wifilink.get('macaddr')).not.toBeUndefined();
      expect(this.wifilink.get('station')).not.toBeUndefined();
    });
  });

});

