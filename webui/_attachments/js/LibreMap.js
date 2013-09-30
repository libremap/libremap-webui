// see http://lostechies.com/derickbailey/2012/04/17/managing-a-modal-dialog-with-backbone-and-marionette/
var ModalRegion = Backbone.Marionette.Region.extend({
  el: "#modal",

  constructor: function(){
    _.bindAll(this);
    Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
    this.on("show", this.showModal, this);
  },

  getEl: function(selector){
    var $el = $(selector);
    $el.on("hidden", this.close);
    return $el;
  },

  showModal: function(view){
    view.on("close", this.hideModal, this);
    this.$el.modal('show');
  },

  hideModal: function(){
    this.$el.modal('hide');
  }
});

var LibreMap = new Backbone.Marionette.Application();

LibreMap.currentCommunity = null;
LibreMap.currentRouter = null;

LibreMap.addRegions({
  mapRegion: "#map",
  sidebarRegion: "#sidebar",
  sidebarTopRegion: "#sidebar-top",
  sidebarMainRegion: "#sidebar-main",
  globalToolboxRegion: "#global-toolbox",
  communityToolboxRegion: "#community-toolbox",
//  routerToolboxRegion: "#router-toolbox",
  statusRegion: "#status",
  modalRegion: ModalRegion
});


LibreMap.routerFromMAC = function (macaddr){
//TODO: this does not scale at all and needs to be implemented in a clean optimized way.
  var router, matched;

// possible server-side option...
// router_id = $.couch.db("libremap").view("libremap/routerByMAC",{success: function(data){console.log(data.rows[0].id)}, keys:["01:35:5C:B3:73:D4"]});
//LibreMap.routers.where({'_id': router_id})
//return router

  for (var i=0; i<LibreMap.routers.length; i++){ 
    router = LibreMap.routers.at(i)
    interfaces = router.get('interfaces')
    if (interfaces!=undefined){
      interfaces.forEach(function(iface){
        if(iface.macaddr==macaddr){
          matched = true;
        }
      });
    }
    if(matched==true){
      return router
    }
  }
}

//-------- Models

LibreMap.Community = Backbone.Model.extend({
  url : function() {
    return this.id ? '/communities/' + this.id : '/communities';
  },
  routerCount: function(){
  },
});

LibreMap.Router = Backbone.Model.extend({
  url : function() {
    // POST to '/routers' and PUT to '/routers/:id'
    return this.id ? '/routers/' + this.id : '/routers';
  },

  save: function(attrs, options) {
  // remove the line attribute from router links before saving. It should not be persisted.
  // TODO: there must be a tidier way of doing this
    if (this.attributes.links){
      this.attributes.links.forEach(function(link){
        if (link.line){
          link.line.destroy();
          delete link.line;
        }
      });
    }
    Backbone.Model.prototype.save.call(this, attrs, options);
  },

  initialize : function(){
    _.bindAll(this, 'isInCurrentCommunity');
  },

  isInCurrentCommunity: function(){
    if (LibreMap.currentCommunity != null){
      if ( this.get('community') == LibreMap.currentCommunity.get('name')){
        return true;
      }
    }
  },

  /*
    select: function(){
    if (!this.get("selected")){
    this.set({selected: true}, {silent: true});
    this.trigger("selected");
    this.collection.select(this);
    }
    LibreMap.vent.trigger("router:selected", this);
    },

    deselect: function(){
    this.unset("selected", {silent: true});
    this.trigger("deselected");
    }
  */
});

//-------- Collections

LibreMap.CommunityCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  comparator: function(collection){
    return(collection.get('name'));
  },
  url: "/communities",
  model: LibreMap.Community,

  initialize : function(){
    _.bindAll(this, 'select');
  },

  select: function(community_id){
    var community = LibreMap.communities.where({'_id': community_id})[0];
    LibreMap.currentCommunity = community;
  }
});

LibreMap.RouterCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  comparator: function(collection){
    return(collection.get('name'));
  },
  url: "/routers",
  model: LibreMap.Router,

  initialize : function(){
    _.bindAll(this, 'select');
  },

  select: function(router){
    LibreMap.currentRouter = router;
  }

});

//-------- Views 

LibreMap.CommunityOptionView = Backbone.Marionette.ItemView.extend({
  tagName: "option",
  className: "community-option",

  initialize : function(){
    _.bindAll(this, 'render');
  },
  render: function(){
    $(this.el).html(this.model.get('name'));
    $(this.el).attr('value', this.model.id);
  },
})

LibreMap.CommunitySelectView = Backbone.Marionette.CompositeView.extend({
  itemView: LibreMap.CommunityOptionView,
  itemViewContainer: "select",
  events: {
    'change': 'select'
  },
  initialize: function(){
    this.template = _.template($('#community-select').html());
    _.bindAll(this, 'select');
  },
  onRender: function(){
    // hacky way to add an empty option as first element
    if (!$('.empty-community-option', this.el).length>0){
      empty_option = new Option('----','',true,true);
      $(empty_option).addClass('empty-community-option');
      $('#community-select', this.el).prepend(empty_option);
    }
  },
  select: function(){
    community_id = $('#community-select', this.el).val();
    LibreMap.vent.trigger("community:selected", community_id)
  }
});

LibreMap.CommunityToolboxView = Backbone.Marionette.ItemView.extend({
//  id: 'community-toolbox',
//  className: 'toolbox',
  events: {
    'click #add-router-link': 'addRouter',
    'click #export-kml-link': 'exportKML',

  },
  initialize : function(){
    this.template = _.template($('#community-toolbox-template').html());
    _.bindAll(this, 'addRouter', 'exportKML');
  },
  addRouter: function(evt){
//    evt.preventDefault();
    LibreMap.vent.trigger('router:add-new', LibreMap.currentCommunity.id);
  },
  exportKML: function(evt){
    LibreMap.vent.trigger('community:export-kml', LibreMap.currentCommunity.id);
  },
  render: function(){
    if(LibreMap.currentCommunity){
      $(this.el).html(this.template(
        {'community_id': LibreMap.currentCommunity.id,
         'community_name': LibreMap.currentCommunity.get('name')}));
    }
  }
});

LibreMap.CommunityExportKMLView = Backbone.Marionette.ItemView.extend({
  className: "modal",
  events: {
  },
  initialize: function(){
    this.template = _.template($("#community-export-kml").html());
  },
  render: function(){
    $(this.el).html(this.template(
      {'kml_data': LibreMap.Map.getKMLdata()}));
  }
})

LibreMap.RouterRowView = Backbone.Marionette.ItemView.extend({
  tagName: "li",
  className: "router-row",
  events: {
    "click": "selectRouter"
  },
  initialize: function(){
    // we load the template here because they aren't ready at page load
    // because we get them through an ajax request
    this.template = _.template($("#router-row-template").html())
    _.bindAll(this, 'selectRouter');

  },
  render: function(){
    var content = this.model.toJSON();
    $(this.el).html(this.template(content));
    LibreMap.refreshRouterLinks(this.model)
  },
  selectRouter: function(evt){
//    evt.preventDefault();
    LibreMap.vent.trigger('router:selected', this.model.id);
  }
})

LibreMap.RouterListView = Backbone.Marionette.CollectionView.extend({
  itemView: LibreMap.RouterRowView,
  tagName: 'ul',
  id: 'routerlist',
  initialize : function(){
    this.collection.on("change", this.updateMarker);
    _.bindAll(this, 'updateMarker');
  },
  onItemAdded: function(itemView){
    // if a community is selected only show router markers for that community
    var router = itemView.model
    if (LibreMap.currentCommunity == null || router.isInCurrentCommunity()){
      if(router.get('location')!=undefined){
        router.marker = LibreMap.Map.createRouterMarker(router);
      }
      else{
        console.log('unpositioned router '+ router.get('name') +', id: '+ router.id);
      }
    }
  },
  appendHtml: function(collectionView, itemView, index){
    // only show routers for the currently selected community
    if (LibreMap.currentCommunity == null || itemView.model.isInCurrentCommunity()){
        collectionView.$el.append(itemView.el);
    }
  },
  onItemRemoved: function(itemView){
    LibreMap.Map.removeRouterMarker(itemView.model);
  },
  onClose: function(){
    LibreMap.Map.resetMarkers();
    LibreMap.Map.resetLinkLines();
   },
  updateMarker: function(router){
    router.marker.destroy();
    router.marker = LibreMap.Map.createRouterMarker(router);
    LibreMap.refreshRouterLinks(router);
  }
});

LibreMap.RouterAddView = Backbone.Marionette.ItemView.extend({
  className: "modal",
  events: {
    'click #pick-coords': 'pickCoords'
  },
  initialize: function(){
    this.template = _.template($("#router-add-template").html());
    _.bindAll(this, 'pickCoords');
  },
  pickCoords: function(){
    routerName = $('#new-router-form #router_hostname').val();
    if (routerName!=""){
      LibreMap.currentRouter = new LibreMap.Router({'name': routerName, 'community_id': LibreMap.currentCommunity.id});
      this.close();
      LibreMap.Map.drawRouterMarker();
    };
  }
/*
render: function(){
    $(this.el).html(this.template({'community': LibreMap.currentCommunity}));
  }
*/
});

LibreMap.RouterDetailView = Backbone.Marionette.ItemView.extend({
  className: "modal",
  events: {
    'click #new-placement': 'newPlacement',
    'click #delete-router': 'destroyCurrentRouter'
  },
  initialize: function(){
    this.template = _.template($("#router-detail-template").html());
    _.bindAll(this, 'newPlacement', 'destroyCurrentRouter');
  },
  newPlacement: function(){
    this.close();
    LibreMap.Map.drawRouterMarker();
  },
  destroyCurrentRouter: function(){
    this.close();
    router_id = LibreMap.currentRouter.id
    LibreMap.vent.trigger('router:destroyed', router_id);
  },
  render: function(){
    var wifilinks = this.model.get('links') // TODO: should only get links of type "wifi"
    var linkList = [];
    
    if (wifilinks != undefined){
      wifilinks.forEach(function(wifilink){
        linkData  = wifilink;
        stationRouter = LibreMap.routerFromMAC(wifilink.attributes.station_mac)
        iface_prefix = wifilink.attributes.interface +": "
        if (stationRouter != undefined){
          linkData['station_name'] = iface_prefix + stationRouter.get("name");
        }
        else{
          linkData['station_name'] = iface_prefix + '---';
        }
        linkList.push(linkData);
        linkList.sort(function(a, b) {
          var textA = a.station_name.toUpperCase();
          var textB = b.station_name.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
      });
    }
    $(this.el).html(this.template({'router': this.model.toJSON(), 'links': linkList}));
  },
  onClose: function(){
// TODO: this view is getting instantiated and closed more than once. Need to investigate
//    LibreMap.currentRouter = null;
//    LibreMap.Map.unselectRouterMarker(this.model);
  }
});

//--------

LibreMap.selectCommunity = function(community_id){
  LibreMap.communities.select(community_id);
  // a new community has been selected, so we re-render the view
  LibreMap.sidebarMainRegion.close();
  var routerListView = new LibreMap.RouterListView({
    collection: LibreMap.routers
  });
  LibreMap.sidebarMainRegion.show(routerListView);

  LibreMap.Map.zoomToRouters();
  var communityToolboxView = new LibreMap.CommunityToolboxView();
  LibreMap.communityToolboxRegion.show(communityToolboxView);
}

LibreMap.exportKML = function(community_id){  
  LibreMap.modalRegion.show(new LibreMap.CommunityExportKMLView());
}

LibreMap.selectRouter = function(router_id){
  var router = LibreMap.routers.where({'_id': router_id})[0];
  LibreMap.routers.select(router);
  var routerDetail = new LibreMap.RouterDetailView({model: router});
  LibreMap.Map.selectRouterMarker(router);
  LibreMap.modalRegion.show(routerDetail);
}

LibreMap.addNewRouter = function(community_id){
  routerAddView = new LibreMap.RouterAddView();
  LibreMap.modalRegion.show(routerAddView);
}

LibreMap.saveRouterToCoords = function(router, coords){
  var loc = router.get("location")
  loc.lat = coords.lat
  loc.lon = coords.lon
  router.set({location: loc});
  router.save();
  if (router == LibreMap.currentRouter){
    LibreMap.currentRouter = null;
  }
}

LibreMap.destroyRouter = function(router_id){
  var router = LibreMap.routers.where({'_id': router_id})[0];
  router.destroy();
}

LibreMap.refreshRouterLinks = function(router){
    var wifilinks = router.get('links') // TODO: should only get links of type "wifi"
    if (wifilinks != undefined){
      wifilinks.forEach(function(wifilink){
        // only show links for the currently selected community
        if (router.isInCurrentCommunity()){
          linkData  = wifilink;
          stationRouter = LibreMap.routerFromMAC(wifilink.alias)
          if (stationRouter){
            linkData.source_location = router.get('location');
            linkData.target_location = stationRouter.get('location');

            if (wifilink.line == undefined){
              wifilink.line = LibreMap.Map.createLinkLine(linkData);
            }
            // if a link line exists, check if it's still current or recreate it
            else{
              if (wifilink.line.link == wifilink){
                LibreMap.Map.displayLinkLine(wifilink)
              }
              else {
                LibreMap.Map.removeLinkLine(wifilink.line);
                wifilink.line = LibreMap.Map.createLinkLine(wifilink)
              }
            }
          }
        }
      });
    }
}

LibreMap.setupCouch = function(db_name){
  Backbone.couch_connector.config.db_name = db_name;
  Backbone.couch_connector.config.ddoc_name = db_name;
  Backbone.couch_connector.config.single_feed = true;
  Backbone.couch_connector.config.global_changes = true;
}

LibreMap.addInitializer(function(options){
  if (options!=undefined){
    var db_name = options.db_name || 'libremap'
  }
  else var db_name = 'libremap';

  LibreMap.setupCouch(db_name);

  LibreMap.communities = new LibreMap.CommunityCollection();
  LibreMap.routers = new LibreMap.RouterCollection();

  var communitySelectView = new LibreMap.CommunitySelectView({collection: LibreMap.communities})
  LibreMap.globalToolboxRegion.show(communitySelectView);
  var routerListView = new LibreMap.RouterListView({collection: LibreMap.routers})
  LibreMap.sidebarMainRegion.show(routerListView);

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

  LibreMap.vent.on("router:coords-picked", function(coords){
    LibreMap.saveRouterToCoords(LibreMap.currentRouter, coords);
  });

  LibreMap.vent.on("router:destroyed", function(router_id){
    LibreMap.destroyRouter(router_id);
  });
  
  /*
    LibreMap.vent.on("router:selected", function(router){
    LibreMap.showRouter(router);
    router.navigate("routers/" + router.id);
    });
  */

  LibreMap.communities.fetch({success: function(){
    LibreMap.routers.fetch({success: function(){
        LibreMap.Map.zoomToRouters();
        if (LibreMap.communities.length==1){
          LibreMap.vent.trigger("community:selected", LibreMap.communities.at(0).id)
          LibreMap.globalToolboxRegion.close();
        }
    }});
  }});


});

LibreMap.on("initialize:after", function(){
//    Backbone.history.start();
});
