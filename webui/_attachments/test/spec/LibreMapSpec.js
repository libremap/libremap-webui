describe('LibreMap', function(){

  var test_db = 'libremap_test';
//  var test_db = 'libremap';
  LibreMap.setupCouch(test_db);
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
    LibreMap.DataGen.PERSIST = true;
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
    LibreMap.DataGen.PERSIST = false;
  }

  var addOneRouterNetToFixture = function(fixture){
    var community = LibreMap.DataGen.generateCommunity();
    fixture.communities.add(community);
    var router = LibreMap.DataGen.generateRouter({hostname: 'arouter', community: community.get('name')});
    fixture.routers.add(router);
  }

  var fakeInit = function(fixture){
    // fakes some necessary initialization steps normally run by LibreMap.start()
    LibreMap.vent.on("community:selected", function(community_id){
      LibreMap.selectCommunity(community_id);
    });
    
    LibreMap.vent.on("community:export-kml", function(community_id){
      LibreMap.exportKML(community_id);
    });
    
    LibreMap.vent.on("router:selected", function(router_id){
      LibreMap.selectRouter(router_id);
    });
    
    LibreMap.vent.on("router:add-new", function(community_id){
      LibreMap.addNewRouter(community_id);
    });
    
    LibreMap.vent.on("router:location-picked", function(location){
      LibreMap.saveRouterToLocation(LibreMap.currentRouter, location);
    });
    
    LibreMap.vent.on("router:destroyed", function(router_id){
      LibreMap.destroyRelatedData(router_id);
    });
    
    LibreMap.communities = fixture.communities;
    LibreMap.routers = fixture.routers;
    LibreMap.currentCommunity = null;
  }

  describe('test-data generator', function(){
    describe('Generated Community', function() {
      beforeEach(function(){
        this.community = LibreMap.DataGen.generateCommunity();
      });

      it('has a name', function() {
        expect(this.community.get('name')).not.toBeUndefined();
        expect(this.community.get('name')).not.toBe('');
      });
      it('does not share name with others', function(){
        var community = LibreMap.DataGen.generateCommunity();
        expect(this.community.get('name')).not.toBe(community.get('name'));
      });
      it('can be created with a given name', function(){
        var community = LibreMap.DataGen.generateCommunity({name: 'mycommunity'});
        expect(community.get('name')).toBe('mycommunity');
      });
      it('can be created with a given id', function(){
        var community = LibreMap.DataGen.generateCommunity({name: 'mycommunity', id: 'mycommunity_0'});
        expect(community.id).toBe('mycommunity_0');
      });
      it('can be created with center coordinates', function(){
        var community = LibreMap.DataGen.generateCommunity(
          {name: 'mycommunity',
           location: {lon: -64.43404197692871, lat: -31.803275545018444}
          });
        expect(community.get('location')).toEqual(
          {lon: -64.43404197692871, lat: -31.803275545018444}
        );
      });
    });

    describe('Generated Router', function() {
      beforeEach(function(){
        this.router = LibreMap.DataGen.generateRouter();
      });
      it('has a hostname', function(){
        expect(this.router.get('hostname')).not.toBeUndefined();
        expect(this.router.get('hostname')).not.toBe('');
      });
      it('does not share hostname with others', function(){
        var router = LibreMap.DataGen.generateRouter();
        expect(this.router.get('hostname')).not.toBe(router.get('hostname'));
      });
      it('can be created with a given hostname', function(){
        var router = LibreMap.DataGen.generateRouter({hostname: 'myrouter'});
        expect(router.get('hostname')).toBe('myrouter');
      });
      it('is part of a community', function(){
        expect(this.router.get('community')).not.toBeUndefined();
      });
      it('can be associated to a given community by name', function(){
        var router = LibreMap.DataGen.generateRouter({hostname: 'myrouter', community: 'mycommunity'});
        expect(router.get('community')).toEqual('mycommunity');
      });
      it('has a site name set to the hostname by default', function(){
        expect(this.router.get('site')).toEqual(this.router.get('hostname'));
      });
      it('can have a site name that is different from the hostname', function(){
        var router = LibreMap.DataGen.generateRouter({hostname: 'myrouter', site: 'mysite'});
        expect(router.get('hostname')).toEqual('myrouter');
        expect(router.get('site')).toEqual('mysite');
      });
      it('has a location', function(){
        expect(this.router.get('location')).not.toBeUndefined();
      });
      it('is located near the community center', function(){
        var lat_diff = this.router.get('location').lat - LibreMap.DataGen.default_location.lat;
        var lon_diff = this.router.get('location').lon - LibreMap.DataGen.default_location.lon;
        var distance = Math.sqrt(Math.pow(2,lat_diff)+Math.pow(2,lon_diff))
        // this was an empirical value taken from routers near map edge at zoom lvl 15
        expect(distance).toBeLessThan(1.425);
      });
      it('has an api_rev, ctime and mtime attributes', function(){
        expect(this.router.get('api_rev')).not.toBeUndefined();
        expect(this.router.get('ctime')).not.toBeUndefined();
        expect(this.router.get('mtime')).not.toBeUndefined();
      });
      it('can have interfaces added', function(){
        LibreMap.DataGen.addInterface(this.router);
        expect(this.router.get('interfaces').length).toEqual(1);
        expect(this.router.get('interfaces')[0]['macaddr']).not.toBeUndefined()
      });
    });

    describe('Generated WifiLink', function() {
      beforeEach(function(){
        this.router = LibreMap.DataGen.generateRouter();
        this.station_mac = LibreMap.DataGen.randomMAC();
        LibreMap.DataGen.addWifiLink(this.router, {station_mac: this.station_mac});
      });
      it('can be created with a given station macaddress', function(){
        expect(this.router.get('links')[0].alias).toEqual(this.station_mac);
      });
    });

    describe('Generated community fixture', function(){
      beforeEach(function(){
        this.fixture = LibreMap.DataGen.generateFixture({ router_count: 10 });
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

  describe('LibreMap Views', function(){
    var router_count = 10;
    beforeEach(function(){
//      stopPersistance();
//      startPersistance();
      this.fixture = LibreMap.DataGen.generateFixture({ router_count: router_count });
      // the RouterListView calls map methods so we draw it
      LibreMap.Map.draw(LibreMap.DataGen.default_location);
    });
    afterEach(function() {
      LibreMap.Map.destroy();
//      stopPersistance();
    });
    describe('RouterListView', function(){
      beforeEach(function(){
        fakeInit(this.fixture);
        this.routerListView = new LibreMap.RouterListView({collection: this.fixture.routers});
        LibreMap.sidebarMainRegion.show(this.routerListView);
      });

      afterEach(function() {
        LibreMap.sidebarMainRegion.reset();
        LibreMap.modalRegion.reset();
      });

      it('shows a list of the existing routers', function(){
        expect($('#routerlist .router-row').length).toEqual(router_count);
      });
      it('adds a list row when a new router is added', function(){
          var router = LibreMap.DataGen.generateRouter({hostname: 'myrouter'});
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
        this.communitySelectView = new LibreMap.CommunitySelectView({collection: this.fixture.communities});
        LibreMap.globalToolboxRegion.show(this.communitySelectView);
      });
      afterEach(function() {
        LibreMap.globalToolboxRegion.reset();
        LibreMap.communityToolboxRegion.reset();
      });
      it('shows a select of existing communities', function(){
        // there's 1 empty option
        expect($('#community-select option').length).toEqual(2);
      });
      it('adds a select option when a new community is added', function(){
        var community = LibreMap.DataGen.generateCommunity({name: 'mycommunity'})
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
        LibreMap.globalToolboxRegion.reset();
        LibreMap.communityToolboxRegion.reset();
      });
      it('shows the Add Router button only when a community is selected', function(){
        expect($('#toolbox #add-router-button')).not.toExist();
        fakeInit(this.fixture);
        LibreMap.vent.trigger("community:selected", this.fixture.communities.models[0].id)
        expect($('#add-router-link')).toExist();
      });
      it('shows the Add Router form when the Add Router button is clicked', function(){
        fakeInit(this.fixture);
        the_net = this.fixture.communities.models[0];
        LibreMap.vent.trigger("community:selected", this.fixture.communities.models[0].id)
        LibreMap.vent.trigger("router:add-new", LibreMap.currentCommunity.id);
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
      LibreMap.Map.draw({lat: -31.802967214779812, lon: -64.41782692156015});
//      stopPersistance();
//      startPersistance();
    });
    afterEach(function() {
      LibreMap.Map.destroy();
    });
    it('shows the OpenLayers Map', function(){
      expect($('.olMapViewport')).toExist();
    });

    describe('Community Features', function(){
      var router_count = 10;
      beforeEach(function(){
        this.fixture = LibreMap.DataGen.generateFixture({ router_count: router_count });
        fakeInit(this.fixture);
        LibreMap.currentCommunity = LibreMap.communities.at(0);
        // the map features render is connected to the RouterListView
        this.routerListView = new LibreMap.RouterListView({collection: this.fixture.routers});
        LibreMap.sidebarMainRegion.show(this.routerListView);
        this.communitySelectView = new LibreMap.CommunitySelectView({collection: this.fixture.communities});
        LibreMap.globalToolboxRegion.show(this.communitySelectView);
      });
      afterEach(function() {
        LibreMap.sidebarMainRegion.reset();
        LibreMap.globalToolboxRegion.reset();
        LibreMap.communityToolboxRegion.reset();
      });
      it('displays a router marker for each router', function(){
        expect(LibreMap.Map.routersLayer.features.length).toEqual(router_count);
      });
      it('adds a router marker when a router is created', function(){
        var community = this.fixture.communities.at(0);
        var router = LibreMap.DataGen.generateRouter({hostname: 'arouter', community: community.get('name')});
        this.fixture.routers.add(router);
        expect(LibreMap.Map.routersLayer.features.length).toEqual(router_count+1);
      });
      it('removes the router marker when a router is deleted', function(){
        var router = this.fixture.routers.at(0);
        router.destroy();
        expect(LibreMap.Map.routersLayer.features.length).toEqual(router_count-1);
      });
      it('shows links between associated routers', function(){
        expect(LibreMap.Map.wifiLinksLayer.features.length).toEqual(router_count-1);
      });
      it('filters displayed router markers when a community is selected', function(){
        addOneRouterNetToFixture(this.fixture);
        $("#community-select option:last").attr('selected','selected').change();
        expect(LibreMap.Map.routersLayer.features.length).toEqual(1);
      });
    });
  });
});

