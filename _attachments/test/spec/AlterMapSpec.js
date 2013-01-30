describe('AlterMap', function(){

  var test_db = 'altermap_test';
  Backbone.couch_connector.config.db_name = test_db;
  Backbone.couch_connector.config.ddoc_name = test_db;
  Backbone.couch_connector.config.single_feed = true;
  Backbone.couch_connector.config.global_changes = true;

  // Enables Mustache.js-like templating.
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }

  var delete_req_settings = {async: false, url: '/'+ test_db, type: 'DELETE',
    statusCode: {
      404: function(){console.log('database already deleted or not created yet')}
    }
  }

  describe('AlterMap test-data generator', function(){
    beforeEach(function(){
      // these are the data generator tests, so we clean the database before each set
      $.ajax(delete_req_settings);
      $.ajax({async: false, url: '/'+ test_db, type: 'PUT'});
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
        var network = DataGen.generateNetwork();
        expect(this.network.get('name')).not.toBe(network.get('name'));
      });
      it('can be created with a given name', function(){
        var network = DataGen.generateNetwork({name: 'mynet'});
        expect(network.get('name')).toBe('mynet');
      });
      it('can be created with a given id', function(){
        var network = DataGen.generateNetwork({name: 'mynet', id: 'mynetwork_0'});
        expect(network.get('_id')).toBe('mynetwork_0');
      });
      it('can be created with center coordinates', function(){
        var network = DataGen.generateNetwork(
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
        this.zone = DataGen.generateZone();
      });
      it('has a name attribute which can be empty', function(){
        expect(this.zone.get('name')).not.toBeUndefined();
      });
      it('can be created with a given name', function(){
        var zone = DataGen.generateZone({name: 'myzone'});
        expect(zone.get('name')).toBe('myzone');
      });
      it('is part of a network', function(){
        expect(this.zone.get('network_id')).not.toBeUndefined();
      });
      it('can be associated to a given network by id', function(){
        var zone = DataGen.generateZone({name: 'myzone', network_id: 'rel_network_0'})
        expect(zone.get('network_id')).toEqual('rel_network_0');
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
        var node = DataGen.generateNode();
        expect(this.node.get('name')).not.toBe(node.get('name'));
      });
      it('can be created with a given name', function(){
        var node = DataGen.generateNode({name: 'mynode'});
        expect(node.get('name')).toBe('mynode');
      });
      it('is part of a zone', function(){
        expect(this.node.get('zone_id')).not.toBeUndefined();
      });
      it('can be associated to a given zone by id', function(){
        var node = DataGen.generateNode({name: 'mynode', zone_id: 'rel_zone_0'});
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
        var node = DataGen.generateNode();
        expect([this.node.get('coords'), this.node.get('elevation')])
          .not.toEqual([node.get('coords'), this.node.get('elevation')]);
      });
    });

    describe('Generated Device', function() {
      beforeEach(function(){
        this.device = DataGen.generateDevice();
      });
      it('is part of a node', function(){
        expect(this.device.get('node_id')).not.toBeUndefined();
      });
      it('can be associated to a given node by id', function(){
        var device = DataGen.generateDevice({node_id: 'mynode_0'});
        expect(device.get('node_id')).toEqual('mynode_0');
      });
    });

    describe('Generated Interface', function(){
      beforeEach(function(){
        this.iface = DataGen.generateInterface();
      });
      it('it has a macaddr', function(){
        expect(this.iface.get('macaddr')).not.toBeUndefined()
      });
      it('can be associated to a given device by id', function(){
        var iface = DataGen.generateInterface({device_id: 'rel_device_0'});
        expect(iface.get('device_id')).toEqual('rel_device_0');
      });
      it('does not share macaddress with others', function(){
        var iface = DataGen.generateInterface();
        expect(this.iface.get('macaddr')).not.toEqual(iface.get('macaddr'));
      });
    });

    describe('Generated Wifilink', function() {
      beforeEach(function(){
        this.wifilink = DataGen.generateWifilink({macaddr: randomMAC(), station: randomMAC()});
      });
      it('can be created with a given macaddr/station pair', function(){
        expect(this.wifilink.get('macaddr')).not.toBeUndefined();
        expect(this.wifilink.get('station')).not.toBeUndefined();
      });
    });

    describe('Generated network fixture', function(){
      beforeEach(function(){
        this.fixture = DataGen.generateFixture({ node_count: 10 });
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
      $.ajax(delete_req_settings);
      $.ajax({async: false, url: '/'+ test_db, type: 'PUT'});
      this.fixture = DataGen.generateFixture({ node_count: node_count });
//      AlterMap.start({db_name: test_db});
//        nodes.fetch();

    });

    describe('NodeListView', function(){
      beforeEach(function(){
//        $.ajax(delete_req_settings);
//        $.ajax({async: false, url: '/'+ test_db, type: 'PUT'});
//        this.fixture = DataGen.generateFixture({ node_count: node_count });
        runs(function(){
          var nodes = new AlterMap.NodeCollection();
          var nodeListView = new AlterMap.NodeListView({collection: nodes})
        });
        // wait for the views to render
        waits(2000);
      });

      it('shows a list of the existing nodes', function(){
        runs(function(){
          expect($('#nodelist .node-row').length).toEqual(node_count);
        });
      });

      it('adds a list row when a new node is added', function(){
        runs(function(){
          DataGen.generateNode({name: 'mynode'})
        });
        waits(1000);
        runs(function(){
          expect($('#nodelist div.node-row a').last()).toHaveText('mynode');
        });
      });
    });

/*
    describe('NetworkSelectView', function(){
      beforeEach(function(){
        runs(function(){
          var networks = new AlterMap.NetworkCollection();
          var networkSelectView = new AlterMap.NetworkSelectView({collection: networks})
        });
        // wait for the views to render
        waits(2000);
      });

      it('shows a select of existing networks', function(){
        runs(function(){
          expect($('#network-select option').length).toEqual(1);
        });
      });
      it('adds a select option when a new network is added', function(){
        runs(function(){
          DataGen.generateNetwork({name: 'mynetwork'})
        });
        // wait for the view to react
        waits(1000);
        runs(function(){
          expect($('#network-select option').last()).toHaveText('mynetwork');
        });
      });
*/  
    });
  });
});

