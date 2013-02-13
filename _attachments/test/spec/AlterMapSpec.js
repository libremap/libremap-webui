describe('AlterMap', function(){

  var test_db = 'altermap_test';
  AlterMap.setupCouch(test_db);

  var delete_req_settings = {async: false, url: '/'+ test_db, type: 'DELETE',
    statusCode: {
      404: function(){console.log('database already deleted or not created yet')}
    }
  }
  var couch_view = {
    "language": "javascript",
    "views": {
      "byCollection": {
        "map": "function(doc) {if (doc.collection) {emit(doc.collection, doc);}}"
      }
    }
  }

  // Enables Mustache.js-like templating.
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }

  beforeEach(function(){
    // delete the couchdb database before each test and create an empty one
    $.ajax(delete_req_settings);
    $.ajax({async: false, url: '/'+ test_db, type: 'PUT'});
    // add byCollection view needed by backbone-couchdb
    $.ajax({
      async: false,
      type: "PUT",
      url: '/'+ test_db + '/_design/'+ test_db,
      contentType: "application/json",
      data: JSON.stringify(couch_view),
    });
  });

  describe('AlterMap test-data generator', function(){

    describe('Generated Network', function() {
      beforeEach(function(){
        this.network = AlterMap.DataGen.generateNetwork();
      });

      it('has a name', function() {
        expect(this.network.get('name')).not.toBeUndefined();
        expect(this.network.get('name')).not.toBe('');
      });
      it('does not share name with others', function(){
        var network = AlterMap.DataGen.generateNetwork();
        expect(this.network.get('name')).not.toBe(network.get('name'));
      });
      it('can be created with a given name', function(){
        var network = AlterMap.DataGen.generateNetwork({name: 'mynet'});
        expect(network.get('name')).toBe('mynet');
      });
      it('can be created with a given id', function(){
        var network = AlterMap.DataGen.generateNetwork({name: 'mynet', id: 'mynetwork_0'});
        expect(network.id).toBe('mynetwork_0');
      });
      it('can be created with center coordinates', function(){
        var network = AlterMap.DataGen.generateNetwork(
          {name: 'mynet',
           coords: {lon: -64.43404197692871, lat: -31.803275545018444}
          });
        expect(network.get('coords')).toEqual(
          {lon: -64.43404197692871, lat: -31.803275545018444}
        );
      });
    });

    describe('Generated Zone', function() {
      beforeEach(function(){
        this.zone = AlterMap.DataGen.generateZone();
      });
      it('has a name attribute which can be empty', function(){
        expect(this.zone.get('name')).not.toBeUndefined();
      });
      it('can be created with a given name', function(){
        var zone = AlterMap.DataGen.generateZone({name: 'myzone'});
        expect(zone.get('name')).toBe('myzone');
      });
      it('is part of a network', function(){
        expect(this.zone.get('network_id')).not.toBeUndefined();
      });
      it('can be associated to a given network by id', function(){
        var zone = AlterMap.DataGen.generateZone({name: 'myzone', network_id: 'rel_network_0'})
        expect(zone.get('network_id')).toEqual('rel_network_0');
      });
    });

    describe('Generated Node', function() {
      beforeEach(function(){
        this.node = AlterMap.DataGen.generateNode();
      });
      it('has a name', function(){
        expect(this.node.get('name')).not.toBeUndefined();
        expect(this.node.get('name')).not.toBe('');
      });
      it('does not share name with others', function(){
        var node = AlterMap.DataGen.generateNode();
        expect(this.node.get('name')).not.toBe(node.get('name'));
      });
      it('can be created with a given name', function(){
        var node = AlterMap.DataGen.generateNode({name: 'mynode'});
        expect(node.get('name')).toBe('mynode');
      });
      it('is part of a zone', function(){
        expect(this.node.get('zone_id')).not.toBeUndefined();
      });
      it('can be associated to a given zone by id', function(){
        var node = AlterMap.DataGen.generateNode({name: 'mynode', zone_id: 'rel_zone_0'});
        expect(node.get('zone_id')).toEqual('rel_zone_0');
      });
      it('has a set of coordinates', function(){
        expect(this.node.get('coords')).not.toBeUndefined();
      });
      it('is near network center', function(){
        var lat_diff = this.node.get('coords').lat - CENTER_COORDS.lat;
        var lon_diff = this.node.get('coords').lon - CENTER_COORDS.lon;
        var distance = Math.sqrt(Math.pow(2,lat_diff)+Math.pow(2,lon_diff))
        // this was an empirical value taken from nodes near map edge at zoom lvl 15
        expect(distance).toBeLessThan(1.425);
      });
      it('does not share position with others', function(){
        var node = AlterMap.DataGen.generateNode();
        expect([this.node.get('coords'), this.node.get('elevation')])
          .not.toEqual([node.get('coords'), this.node.get('elevation')]);
      });
    });

    describe('Generated Device', function() {
      beforeEach(function(){
        this.device = AlterMap.DataGen.generateDevice();
      });
      it('is part of a node', function(){
        expect(this.device.get('node_id')).not.toBeUndefined();
      });
      it('can be associated to a given node by id', function(){
        var device = AlterMap.DataGen.generateDevice({node_id: 'mynode_0'});
        expect(device.get('node_id')).toEqual('mynode_0');
      });
    });

    describe('Generated Interface', function(){
      beforeEach(function(){
        this.iface = AlterMap.DataGen.generateInterface();
      });
      it('it has a macaddr', function(){
        expect(this.iface.get('macaddr')).not.toBeUndefined()
      });
      it('can be associated to a given device by id', function(){
        var iface = AlterMap.DataGen.generateInterface({device_id: 'rel_device_0'});
        expect(iface.get('device_id')).toEqual('rel_device_0');
      });
      it('does not share macaddress with others', function(){
        var iface = AlterMap.DataGen.generateInterface();
        expect(this.iface.get('macaddr')).not.toEqual(iface.get('macaddr'));
      });
    });

    describe('Generated Wifilink', function() {
      beforeEach(function(){
        this.wifilink = AlterMap.DataGen.generateWifilink({macaddr: randomMAC(), station: randomMAC()});
      });
      it('can be created with a given macaddr/station pair', function(){
        expect(this.wifilink.get('macaddr')).not.toBeUndefined();
        expect(this.wifilink.get('station')).not.toBeUndefined();
      });
    });
    describe('Generated network fixture', function(){
      beforeEach(function(){
        this.fixture = AlterMap.DataGen.generateFixture({ node_count: 10 });
      });
      it('has the expected number of networks', function(){
        expect(this.fixture.networks).not.toBeUndefined();
        expect(this.fixture.networks.length).toBe(1);
      });
      it('has the expected number of zones', function(){
        expect(this.fixture.zones).not.toBeUndefined();
        expect(this.fixture.zones.length).toBe(1);
      });
      it('has the expected number of nodes', function(){
        expect(this.fixture.nodes).not.toBeUndefined();
        expect(this.fixture.nodes.length).toBe(10);
      });
      it('has the expected number of wifilinks', function(){
        expect(this.fixture.wifilinks).not.toBeUndefined();
        expect(this.fixture.wifilinks.length).toBe(9)
      });
    });
  });

  describe('AlterMap Views', function(){
    var node_count = 10;

    beforeEach(function(){
      runs(function(){
        this.fixture = AlterMap.DataGen.generateFixture({ node_count: node_count });
        // the NodeListView calls map methods so we draw it
        AlterMap.Map.draw({lat: -31.802967214779812, lon: -64.41782692156015});
      });
      waits(500);
    });

    afterEach(function() {
      // reset collections data
      AlterMap.Map.destroy();
      this.fixture.networks.reset();
      this.fixture.zones.reset();
      this.fixture.nodes.reset();
      this.fixture.wifilinks.reset();
    });

    describe('NodeListView', function(){
      beforeEach(function(){
        this.nodeListView = new AlterMap.NodeListView({collection: this.fixture.nodes});
        AlterMap.sidebarMainRegion.show(this.nodeListView);
      });

      afterEach(function() {
        AlterMap.sidebarMainRegion.close();
//        $('#sidebar').append('<ul id="nodelist"></ul>');
//        this.nodeListView.remove();
      });

      it('shows a list of the existing nodes', function(){
        expect($('#nodelist .node-row').length).toEqual(node_count);
      });

      it('adds a list row when a new node is added', function(){
          var node = AlterMap.DataGen.generateNode({name: 'mynode'});
          this.fixture.nodes.add(node);
          last_item = $('#nodelist li.node-row a').last()
          expect(last_item).toHaveText('mynode');
      });
    });

    describe('NetworkSelectView', function(){
      beforeEach(function(){
        this.networkSelectView = new AlterMap.NetworkSelectView({collection: this.fixture.networks});
        AlterMap.sidebarTopRegion.show(this.networkSelectView);
      });

      afterEach(function() {
        AlterMap.sidebarTopRegion.close();
      });

      it('shows a select of existing networks', function(){
        expect($('#network-select option').length).toEqual(1);
      });
      it('adds a select option when a new network is added', function(){
        var network = AlterMap.DataGen.generateNetwork({name: 'mynetwork'})
        this.fixture.networks.add(network);
        waits(500);
        runs(function(){
          expect($('#network-select option').last()).toHaveText('mynetwork');
        });
      });
      // wait for the view to react
      it('filters the node list when a network is selected', function(){

        AlterMap.vent.bind("network:selected", function(network){
          AlterMap.showNetwork(network);
        });

        var network = AlterMap.DataGen.generateNetwork({name: 'anetwork'});
        this.fixture.networks.add(network);
        var zone = AlterMap.DataGen.generateZone({network_id: network.id});
        this.fixture.zones.add(zone);
        var node = AlterMap.DataGen.generateNode({name: 'anode', zone_id: zone.id});
        this.fixture.nodes.add(node);
        AlterMap.networks = this.fixture.networks;
        AlterMap.zones = this.fixture.zones;
        AlterMap.nodes = this.fixture.nodes;
        $("#network-select option:last").attr('selected','selected').change();
        
        waits(500);
        runs(function(){
          expect($('#nodelist li.node-row').length).toEqual(1);
          last_item = $('#nodelist li.node-row a').last()
          expect(last_item).toHaveText('anode');
          AlterMap.sidebarMainRegion.close();
        });
      });  
    });
  });

  describe('AlterMap Map', function(){

    beforeEach(function(){
      runs(function(){
        AlterMap.Map.draw({lat: -31.802967214779812, lon: -64.41782692156015});
      });
      waits(1000);
    });
    afterEach(function() {
      AlterMap.Map.destroy();
    });

    it('shows the OpenLayers Map', function(){
      expect($('.olMapViewport')).toExist();
    });
    describe('Network Features', function(){
      var node_count = 10;

      beforeEach(function(){
        runs(function(){
          this.fixture = AlterMap.DataGen.generateFixture({ node_count: node_count });
        });
        waits(1000);
      });

      afterEach(function() {
        // reset collections data
        this.fixture.networks.reset();
        this.fixture.zones.reset();
        this.fixture.nodes.reset();
        this.fixture.wifilinks.reset();
      });

      it('displays a node marker for each node in the database', function(){
        waits(500);
        runs(function(){
          AlterMap.start({db_name: 'altermap_test'});
        });
        waits(500);
        runs(function(){
          expect(AlterMap.Map.nodesLayer.features.length).toEqual(node_count);
        });
      });
    });
  });
});

