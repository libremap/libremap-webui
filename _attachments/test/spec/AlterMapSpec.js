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

  var addOneRouterNetToFixture = function(fixture){
    var community = AlterMap.DataGen.generateCommunity();
    fixture.communities.add(community);
    var router = AlterMap.DataGen.generateRouter({hostname: 'arouter', community: community.get('name')});
    fixture.routers.add(router);
  }

  var fakeInit = function(fixture){
    // fakes some necessary initialization steps normally run by AlterMap.start()
    AlterMap.vent.on("community:selected", function(community_id){
      AlterMap.selectCommunity(community_id);
    });
    
    AlterMap.vent.on("community:export-kml", function(community_id){
      AlterMap.exportKML(community_id);
    });
    
    AlterMap.vent.on("router:selected", function(router_id){
      AlterMap.selectRouter(router_id);
    });
    
    AlterMap.vent.on("router:add-new", function(community_id){
      AlterMap.addNewRouter(community_id);
    });
    
    AlterMap.vent.on("router:coords-picked", function(coords){
      AlterMap.saveRouterToCoords(AlterMap.currentRouter, coords);
    });
    
    AlterMap.vent.on("router:destroyed", function(router_id){
      AlterMap.destroyRelatedData(router_id);
    });
    
    AlterMap.communities = fixture.communities;
    AlterMap.routers = fixture.routers;
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
        var community = AlterMap.DataGen.generateCommunity({name: 'mycommunity'});
        expect(community.get('name')).toBe('mycommunity');
      });
      it('can be created with a given id', function(){
        var community = AlterMap.DataGen.generateCommunity({name: 'mycommunity', id: 'mycommunity_0'});
        expect(community.id).toBe('mycommunity_0');
      });
      it('can be created with center coordinates', function(){
        var community = AlterMap.DataGen.generateCommunity(
          {name: 'mycommunity',
           coords: {lon: -64.43404197692871, lat: -31.803275545018444}
          });
        expect(community.get('coords')).toEqual(
          {lon: -64.43404197692871, lat: -31.803275545018444}
        );
      });
    });

    describe('Generated Router', function() {
      beforeEach(function(){
        this.router = AlterMap.DataGen.generateRouter();
      });
      it('has a hostname', function(){
        expect(this.router.get('hostname')).not.toBeUndefined();
        expect(this.router.get('hostname')).not.toBe('');
      });
      it('does not share hostname with others', function(){
        var router = AlterMap.DataGen.generateRouter();
        expect(this.router.get('hostname')).not.toBe(router.get('hostname'));
      });
      it('can be created with a given hostname', function(){
        var router = AlterMap.DataGen.generateRouter({hostname: 'myrouter'});
        expect(router.get('hostname')).toBe('myrouter');
      });
      it('is part of a community', function(){
        expect(this.router.get('community')).not.toBeUndefined();
      });
      it('can be associated to a given community by name', function(){
        var router = AlterMap.DataGen.generateRouter({hostname: 'myrouter', community: 'mycommunity'});
        expect(router.get('community')).toEqual('mycommunity');
      });
      it('has a node name set to the hostname by default', function(){
        expect(this.router.get('node')).toEqual(this.router.get('hostname'));
      });
      it('can have a node name that is different from the hostname', function(){
        var router = AlterMap.DataGen.generateRouter({hostname: 'myrouter', node: 'mynode'});
        expect(router.get('hostname')).toEqual('myrouter');
        expect(router.get('node')).toEqual('mynode');
      });
      it('has a set of coordinates', function(){
        expect(this.router.get('coords')).not.toBeUndefined();
      });
      it('is near community center', function(){
        var lat_diff = this.router.get('coords').lat - AlterMap.DataGen.default_coords.lat;
        var lon_diff = this.router.get('coords').lon - AlterMap.DataGen.default_coords.lon;
        var distance = Math.sqrt(Math.pow(2,lat_diff)+Math.pow(2,lon_diff))
        // this was an empirical value taken from routers near map edge at zoom lvl 15
        expect(distance).toBeLessThan(1.425);
      });
      it('can have interfaces added', function(){
        AlterMap.DataGen.addInterface(this.router);
        expect(this.router.get('interfaces').length).toEqual(1);
        expect(this.router.get('interfaces')[0]['macaddr']).not.toBeUndefined()
      });
    });

    describe('Generated WifiLink', function() {
      beforeEach(function(){
        this.router = AlterMap.DataGen.generateRouter();
        this.local_mac = AlterMap.DataGen.randomMAC();
        this.station_mac = AlterMap.DataGen.randomMAC();
        AlterMap.DataGen.addWifiLink(this.router, {local_mac: this.local_mac, station_mac: this.station_mac});
        this.wifilink = this.router.get('links')[0]
      });
      it('can be created with a given local and station macaddress pair', function(){
        expect(this.wifilink.attributes.local_mac).toEqual(this.local_mac);
        expect(this.wifilink.attributes.station_mac).toEqual(this.station_mac);
      });
    });

    describe('Generated community fixture', function(){
      beforeEach(function(){
        this.fixture = AlterMap.DataGen.generateFixture({ router_count: 10 });
      });
      it('has the expected number of communities', function(){
        expect(this.fixture.communities).not.toBeUndefined();
        expect(this.fixture.communities.length).toBe(1);
      });
      it('has the expected number of routers', function(){
        expect(this.fixture.routers).not.toBeUndefined();
        expect(this.fixture.routers.length).toBe(10);
      });
     it('has the expected number of wifilinks', function(){
       expect(this.fixture.wifilinks).not.toBeUndefined();
       expect(this.fixture.wifilinks.length).toBe(9)
     });
    });
  });

  describe('AlterMap Views', function(){
    var router_count = 10;
    beforeEach(function(){
//      stopPersistance();
//      startPersistance();
      this.fixture = AlterMap.DataGen.generateFixture({ router_count: router_count });
      // the RouterListView calls map methods so we draw it
      AlterMap.Map.draw(AlterMap.DataGen.default_coords);
    });
    afterEach(function() {
      AlterMap.Map.destroy();
//      stopPersistance();
    });
    describe('RouterListView', function(){
      beforeEach(function(){
        fakeInit(this.fixture);
        this.routerListView = new AlterMap.RouterListView({collection: this.fixture.routers});
        AlterMap.sidebarMainRegion.show(this.routerListView);
      });

      afterEach(function() {
        AlterMap.sidebarMainRegion.reset();
        AlterMap.modalRegion.reset();
      });

      it('shows a list of the existing routers', function(){
        expect($('#routerlist .router-row').length).toEqual(router_count);
      });
      it('adds a list row when a new router is added', function(){
          var router = AlterMap.DataGen.generateRouter({hostname: 'myrouter'});
          this.fixture.routers.add(router);
          last_item = $('#routerlist li.router-row a').last()
          expect(last_item).toHaveText('myrouter');
      });
      it('shows the router detail when a router row is clicked', function(){
        $(".router-row a").last().trigger("click");
        expect($('#modal #router-detail')).toExist();      
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
      it('filters the router list when a community is selected', function(){
        addOneRouterNetToFixture(this.fixture);
        fakeInit(this.fixture);
        $("#community-select option:last").attr('selected','selected').change();
        expect($('#routerlist li.router-row').length).toEqual(1);
        last_item = $('#routerlist li.router-row a').last()
        expect(last_item).toHaveText('arouter');
      });  
    });

    describe('CommunityToolboxView', function(){
      afterEach(function() {
        AlterMap.globalToolboxRegion.reset();
        AlterMap.communityToolboxRegion.reset();
      });
      it('shows the Add Router button only when a community is selected', function(){
        expect($('#toolbox #add-router-button')).not.toExist();
        fakeInit(this.fixture);
        AlterMap.vent.trigger("community:selected", this.fixture.communities.models[0].id)
        expect($('#add-router-link')).toExist();
      });
      it('shows the Add Router form when the Add Router button is clicked', function(){
        fakeInit(this.fixture);
        the_net = this.fixture.communities.models[0];
        AlterMap.vent.trigger("community:selected", this.fixture.communities.models[0].id)
        AlterMap.vent.trigger("router:add-new", AlterMap.currentCommunity.id);
        expect($('#modal #new-router-form')).toExist();
      });
      it('activates router positioning when the form is submitted', function(){
      });
      it('saves the router location', function(){
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
      var router_count = 10;
      beforeEach(function(){
        this.fixture = AlterMap.DataGen.generateFixture({ router_count: router_count });
        fakeInit(this.fixture);
        AlterMap.currentCommunity = AlterMap.communities.at(0);
        // the map features render is connected to the RouterListView
        this.routerListView = new AlterMap.RouterListView({collection: this.fixture.routers});
        AlterMap.sidebarMainRegion.show(this.routerListView);
        this.communitySelectView = new AlterMap.CommunitySelectView({collection: this.fixture.communities});
        AlterMap.globalToolboxRegion.show(this.communitySelectView);
      });
      afterEach(function() {
        AlterMap.sidebarMainRegion.reset();
        AlterMap.globalToolboxRegion.reset();
        AlterMap.communityToolboxRegion.reset();
      });
      it('displays a router marker for each router', function(){
        expect(AlterMap.Map.routersLayer.features.length).toEqual(router_count);
      });
      it('adds a router marker when a router is created', function(){
        var community = this.fixture.communities.at(0);
        var router = AlterMap.DataGen.generateRouter({hostname: 'arouter', community: community.get('name')});
        this.fixture.routers.add(router);
        expect(AlterMap.Map.routersLayer.features.length).toEqual(router_count+1);
      });
      it('removes the router marker when a router is deleted', function(){
        var router = this.fixture.routers.at(0);
        router.destroy();
        expect(AlterMap.Map.routersLayer.features.length).toEqual(router_count-1);
      });
      it('shows links between associated routers', function(){
        expect(AlterMap.Map.wifiLinksLayer.features.length).toEqual(router_count-1);
      });
      it('filters displayed router markers when a community is selected', function(){
        addOneRouterNetToFixture(this.fixture);
        $("#community-select option:last").attr('selected','selected').change();
        expect(AlterMap.Map.routersLayer.features.length).toEqual(1);
      });
    });
  });
});

