describe('AlterMap', function(){

  var test_db = 'altermap_test';
//  var test_db = 'altermap';
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
    var community = AlterMap.DataGen.generateCommunity();
    fixture.communities.add(community);
    var node = AlterMap.DataGen.generateNode({name: 'anode', community_id: community.id});
    fixture.nodes.add(node);
  }

  var fakeInit = function(fixture){
    // fakes some necessary initialization steps normally run by AlterMap.start()
    AlterMap.vent.on("community:selected", function(community_id){
      AlterMap.selectCommunity(community_id);
    });
    
    AlterMap.vent.on("community:export-kml", function(community_id){
      AlterMap.exportKML(community_id);
    });
    
    AlterMap.vent.on("node:selected", function(node_id){
      AlterMap.selectNode(node_id);
    });
    
    AlterMap.vent.on("node:add-new", function(community_id){
      AlterMap.addNewNode(community_id);
    });
    
    AlterMap.vent.on("node:coords-picked", function(coords){
      AlterMap.saveNodeToCoords(AlterMap.currentNode, coords);
    });
    
    AlterMap.vent.on("node:destroyed", function(node_id){
      AlterMap.destroyRelatedData(node_id);
    });
    
    AlterMap.communities = fixture.communities;
    AlterMap.nodes = fixture.nodes;
    AlterMap.currentCommunity = null;
  }

  describe('test-data generator', function(){
    describe('Generated Community', function() {
      beforeEach(function(){
        this.community = AlterMap.DataGen.generateCommunity();
      });

      it('has a name', function() {
        expect(this.community.get('name')).not.toBeUndefined();
        expect(this.community.get('name')).not.toBe('');
      });
      it('does not share name with others', function(){
        var community = AlterMap.DataGen.generateCommunity();
        expect(this.community.get('name')).not.toBe(community.get('name'));
      });
      it('can be created with a given name', function(){
        var community = AlterMap.DataGen.generateCommunity({name: 'mynet'});
        expect(community.get('name')).toBe('mynet');
      });
      it('can be created with a given id', function(){
        var community = AlterMap.DataGen.generateCommunity({name: 'mynet', id: 'mycommunity_0'});
        expect(community.id).toBe('mycommunity_0');
      });
      it('can be created with center coordinates', function(){
        var community = AlterMap.DataGen.generateCommunity(
          {name: 'mynet',
           coords: {lon: -64.43404197692871, lat: -31.803275545018444}
          });
        expect(community.get('coords')).toEqual(
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
      it('is part of a community', function(){
        expect(this.node.get('community_id')).not.toBeUndefined();
      });
      it('can be associated to a given community by id', function(){
        var node = AlterMap.DataGen.generateNode({name: 'mynode', community_id: 'rel_net_0'});
        expect(node.get('community_id')).toEqual('rel_net_0');
      });
      it('has a set of coordinates', function(){
        expect(this.node.get('coords')).not.toBeUndefined();
      });
      it('is near community center', function(){
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
        this.node = AlterMap.DataGen.generateNode();
        this.hostname = this.node.get('name')+"--my_device"
        AlterMap.DataGen.addDevice(this.node, {'hostname': this.hostname});
        this.device = this.node.get('devices')[0]
      });
      it('gets added to a device-less node', function(){
        expect(this.device['hostname']).toEqual(this.hostname);
      });
      it('gets added to the device list of a node', function(){
        var new_hostname = this.node.get('name')+"--my_other_device"
        AlterMap.DataGen.addDevice(this.node, {'hostname': new_hostname});
        this.new_device = this.node.get('devices').slice(-1)[0];
        expect(this.node.get('devices').length).toEqual(2);
        expect(this.new_device['hostname']).toEqual(new_hostname);
      });
      it('has some valid interface data associated', function(){
        expect(this.device['interfaces'][0]['macaddr']).not.toBeUndefined()
      });
    });

    describe('Generated WifiLink', function() {
      beforeEach(function(){
        this.node = AlterMap.DataGen.generateNode();
        this.local_mac = AlterMap.DataGen.randomMAC();
        this.station_mac = AlterMap.DataGen.randomMAC();
        AlterMap.DataGen.addWifiLink(this.node, {local_mac: this.local_mac, station_mac: this.station_mac});
        this.wifilink = this.node.get('links')[0]
      });
      it('can be created with a given local and station macaddress pair', function(){
        expect(this.wifilink.attributes.local_mac).toEqual(this.local_mac);
        expect(this.wifilink.attributes.station_mac).toEqual(this.station_mac);
      });
    });

    describe('Generated community fixture', function(){
      beforeEach(function(){
        this.fixture = AlterMap.DataGen.generateFixture({ node_count: 10 });
      });
      it('has the expected number of communities', function(){
        expect(this.fixture.communities).not.toBeUndefined();
        expect(this.fixture.communities.length).toBe(1);
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
//      stopPersistance();
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
        fakeInit(this.fixture);
        this.nodeListView = new AlterMap.NodeListView({collection: this.fixture.nodes});
        AlterMap.sidebarMainRegion.show(this.nodeListView);
      });

      afterEach(function() {
        AlterMap.sidebarMainRegion.reset();
        AlterMap.modalRegion.reset();
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
      it('shows the node detail when a node row is clicked', function(){
        $(".node-row a").last().trigger("click");
        expect($('#modal #node-detail')).toExist();      
      });
    });
    describe('CommunitySelectView', function(){
      beforeEach(function(){
        this.communitySelectView = new AlterMap.CommunitySelectView({collection: this.fixture.communities});
        AlterMap.globalToolboxRegion.show(this.communitySelectView);
      });
      afterEach(function() {
        AlterMap.globalToolboxRegion.reset();
        AlterMap.communityToolboxRegion.reset();
      });
      it('shows a select of existing communities', function(){
        // there's 1 empty option
        expect($('#community-select option').length).toEqual(2);
      });
      it('adds a select option when a new community is added', function(){
        var community = AlterMap.DataGen.generateCommunity({name: 'mycommunity'})
        this.fixture.communities.add(community);
        expect($('#community-select option').last()).toHaveText('mycommunity');
      });
      it('filters the node list when a community is selected', function(){
        addOneNodeNetToFixture(this.fixture);
        fakeInit(this.fixture);
        $("#community-select option:last").attr('selected','selected').change();
        expect($('#nodelist li.node-row').length).toEqual(1);
        last_item = $('#nodelist li.node-row a').last()
        expect(last_item).toHaveText('anode');
      });  
    });

    describe('CommunityToolboxView', function(){
      afterEach(function() {
        AlterMap.globalToolboxRegion.reset();
        AlterMap.communityToolboxRegion.reset();
      });
      it('shows the Add Node button only when a community is selected', function(){
        expect($('#toolbox #add-node-button')).not.toExist();
        fakeInit(this.fixture);
        AlterMap.vent.trigger("community:selected", this.fixture.communities.models[0].id)
        expect($('#add-node-link')).toExist();
      });
      it('shows the Add Node form when the Add Node button is clicked', function(){
        fakeInit(this.fixture);
        the_net = this.fixture.communities.models[0];
        AlterMap.vent.trigger("community:selected", this.fixture.communities.models[0].id)
        AlterMap.vent.trigger("node:add-new", AlterMap.currentCommunity.id);
        expect($('#modal #new-node-form')).toExist();
      });
      it('activates node positioning when the form is submitted', function(){
      });
      it('saves the node location', function(){
        $(".olMapViewport").trigger("click");
      });
    });
  });

  describe('Map', function(){
    beforeEach(function(){
      AlterMap.Map.draw({lat: -31.802967214779812, lon: -64.41782692156015});
//      stopPersistance();
//      startPersistance();
    });
    afterEach(function() {
      AlterMap.Map.destroy();
    });
    it('shows the OpenLayers Map', function(){
      expect($('.olMapViewport')).toExist();
    });

    describe('Community Features', function(){
      var node_count = 10;
      beforeEach(function(){
        this.fixture = AlterMap.DataGen.generateFixture({ node_count: node_count });
        fakeInit(this.fixture);
        AlterMap.currentCommunity = AlterMap.communities.at(0);
        // the map features render is connected to the NodeListView
        this.nodeListView = new AlterMap.NodeListView({collection: this.fixture.nodes});
        AlterMap.sidebarMainRegion.show(this.nodeListView);
        this.communitySelectView = new AlterMap.CommunitySelectView({collection: this.fixture.communities});
        AlterMap.globalToolboxRegion.show(this.communitySelectView);
      });
      afterEach(function() {
        AlterMap.sidebarMainRegion.reset();
        AlterMap.globalToolboxRegion.reset();
        AlterMap.communityToolboxRegion.reset();
      });
      it('displays a node marker for each node', function(){
        expect(AlterMap.Map.nodesLayer.features.length).toEqual(node_count);
      });
      it('adds a node marker when a node is created', function(){
        var community = this.fixture.communities.at(0);
        var node = AlterMap.DataGen.generateNode({name: 'anode', community_id: community.id});
        this.fixture.nodes.add(node);
        expect(AlterMap.Map.nodesLayer.features.length).toEqual(node_count+1);
      });
      it('removes the node marker when a node is deleted', function(){
        var node = this.fixture.nodes.at(0);
        node.destroy();
        expect(AlterMap.Map.nodesLayer.features.length).toEqual(node_count-1);
      });
      it('shows links between associated nodes', function(){
        expect(AlterMap.Map.wifiLinksLayer.features.length).toEqual(node_count-1);
      });
      it('filters displayed node markers when a community is selected', function(){
        addOneNodeNetToFixture(this.fixture);
        $("#community-select option:last").attr('selected','selected').change();
        expect(AlterMap.Map.nodesLayer.features.length).toEqual(1);
      });
    });
  });
});

