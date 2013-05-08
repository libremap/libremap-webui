describe('AlterMap', function(){
//  var async = new AsyncSpec(this);

  // Enables Mustache.js-like templating.
/*
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }
*/
  var test_db = 'altermap_test';
  AlterMap.setupCouch(test_db);
  $.ajax({async: false, url: '/'+ test_db, type: 'PUT'});

  var startPersistance = function(){
    var couch_view = {
      "language": "javascript",
      "views": {
        "byCollection": {
          "map": "function(doc) {if (doc.collection) {emit(doc.collection, doc);}}"
        }
      }
    }
    // create the database if it does not exist
    $.ajax({async: false, url: '/'+ test_db, type: 'PUT'});
    // add the byCollection view needed by backbone-couchdb
    $.ajax({
      async: false,
      type: "PUT",
      url: '/'+ test_db + '/_design/'+ test_db,
      contentType: "application/json",
      data: JSON.stringify(couch_view),
    });
    AlterMap.DataGen.PERSIST = true;
  }

  var stopPersistance = function(){
    var delete_req_settings = {
      async: false, url: '/'+ test_db, type: 'DELETE',
      statusCode: {
        404: function(){console.log('database already deleted or not created yet')}
      }
    }
    // delete the database
    $.ajax(delete_req_settings);
    AlterMap.DataGen.PERSIST = false;
  }

  var addOneNodeNetToFixture = function(fixture){
    var network = AlterMap.DataGen.generateNetwork();
    fixture.networks.add(network);
    var node = AlterMap.DataGen.generateNode({name: 'anode', network_id: network.id});
    fixture.nodes.add(node);
  }

  var fakeInit = function(fixture){
    // fakes some necessary initialization steps normally run by AlterMap.start()
    AlterMap.vent.bind("network:selected", function(network_id){
      AlterMap.selectNetwork(network_id);
    });
    AlterMap.vent.bind("node:add-new", function(network_id){
      AlterMap.addNewNode(network_id);
    });
    AlterMap.networks = fixture.networks;
    AlterMap.nodes = fixture.nodes;
    AlterMap.devices = fixture.devices;
    AlterMap.interfaces = fixture.interfaces;
    AlterMap.wifilinks = fixture.wifilinks;
    AlterMap.currentNetwork = null;
  }

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
      it('is part of a network', function(){
        expect(this.node.get('network_id')).not.toBeUndefined();
      });
      it('can be associated to a given network by id', function(){
        var node = AlterMap.DataGen.generateNode({name: 'mynode', network_id: 'rel_net_0'});
        expect(node.get('network_id')).toEqual('rel_net_0');
      });
      it('has a set of coordinates', function(){
        expect(this.node.get('coords')).not.toBeUndefined();
      });
      it('is near network center', function(){
        var lat_diff = this.node.get('coords').lat - AlterMap.DataGen.default_coords.lat;
        var lon_diff = this.node.get('coords').lon - AlterMap.DataGen.default_coords.lon;
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

    describe('Generated WifiLink', function() {
      beforeEach(function(){
        this.wifilink = AlterMap.DataGen.generateWifiLink(
          {macaddr: AlterMap.DataGen.randomMAC(), station: AlterMap.DataGen.randomMAC()});
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
//      startPersistance();
      this.fixture = AlterMap.DataGen.generateFixture({ node_count: node_count });
      // the NodeListView calls map methods so we draw it
      AlterMap.Map.draw(AlterMap.DataGen.default_coords);
    });
    afterEach(function() {
      AlterMap.Map.destroy();
//      stopPersistance();
    });
    describe('NodeListView', function(){
      beforeEach(function(){
        this.nodeListView = new AlterMap.NodeListView({collection: this.fixture.nodes});
        AlterMap.sidebarMainRegion.show(this.nodeListView);
      });

      afterEach(function() {
        AlterMap.sidebarMainRegion.reset();
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
        AlterMap.globalToolboxRegion.show(this.networkSelectView);
      });
      afterEach(function() {
        AlterMap.globalToolboxRegion.reset();
        AlterMap.networkToolboxRegion.reset();
      });
      it('shows a select of existing networks', function(){
// there's 1 empty option
        expect($('#network-select option').length).toEqual(2);
      });
      it('adds a select option when a new network is added', function(){
        var network = AlterMap.DataGen.generateNetwork({name: 'mynetwork'})
        this.fixture.networks.add(network);
        expect($('#network-select option').last()).toHaveText('mynetwork');
      });
      it('filters the node list when a network is selected', function(){
        addOneNodeNetToFixture(this.fixture);
        fakeInit(this.fixture);
        $("#network-select option:last").attr('selected','selected').change();
        expect($('#nodelist li.node-row').length).toEqual(1);
        last_item = $('#nodelist li.node-row a').last()
        expect(last_item).toHaveText('anode');
      });  
    });

    describe('NetworkToolboxView', function(){
      afterEach(function() {
        AlterMap.globalToolboxRegion.reset();
        AlterMap.networkToolboxRegion.reset();
      });
      it('shows the Add Node button only when a network is selected', function(){
        expect($('#toolbox #add-node-button')).not.toExist();
        fakeInit(this.fixture);
        AlterMap.vent.trigger("network:selected", this.fixture.networks.models[0].id)
        expect($('#add-node-link')).toExist();
      });
      it('shows the Add Node form when the Add Node button is clicked', function(){
        fakeInit(this.fixture);
        the_net = this.fixture.networks.models[0];
        AlterMap.vent.trigger("network:selected", this.fixture.networks.models[0].id)
        AlterMap.vent.trigger("node:add-new", AlterMap.currentNetwork.id);
        expect($('#modal #new-node-form')).toExist();
      });
      it('activates node positioning when the form is submitted', function(){
      });
      it('saves the node location', function(){
        $(".olMapViewport").trigger("click");
      });
/*
      it('has the correct form fields and some default values pre-set', function(){
      });
      it('prevents posting the form with missing required values', function(){
      });
*/
    });
  });
  describe('AlterMap Map', function(){
    beforeEach(function(){
      AlterMap.Map.draw({lat: -31.802967214779812, lon: -64.41782692156015});
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
        this.fixture = AlterMap.DataGen.generateFixture({ node_count: node_count });
        fakeInit(this.fixture);
        // the map features render is connected to the NodeListView
        this.nodeListView = new AlterMap.NodeListView({collection: this.fixture.nodes});
        AlterMap.sidebarMainRegion.show(this.nodeListView);
        this.networkSelectView = new AlterMap.NetworkSelectView({collection: this.fixture.networks});
        AlterMap.globalToolboxRegion.show(this.networkSelectView);
      });
      afterEach(function() {
        AlterMap.sidebarMainRegion.reset();
        AlterMap.globalToolboxRegion.reset();
        AlterMap.networkToolboxRegion.reset();
      });
      it('displays a node marker for each node', function(){
        expect(AlterMap.Map.nodesLayer.features.length).toEqual(node_count);
      });
      it('filters displayed node markers when a network is selected', function(){
          addOneNodeNetToFixture(this.fixture);
          $("#network-select option:last").attr('selected','selected').change();
          expect(AlterMap.Map.nodesLayer.features.length).toEqual(1);
      });
      it('shows links between associated nodes', function(){
        this.wifiLinksView = new AlterMap.WifiLinksView({collection: this.fixture.wifilinks});
        this.wifiLinksView.render();
        expect(AlterMap.Map.wifiLinksLayer.features.length).toEqual(node_count-1);          
      });
    });
  });
});

