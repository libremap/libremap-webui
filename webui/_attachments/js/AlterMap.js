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

var AlterMap = new Backbone.Marionette.Application();

AlterMap.currentCommunity = null;
AlterMap.currentRouter = null;

AlterMap.addRegions({
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


AlterMap.routerFromMAC = function (macaddr){
//TODO: this does not scale at all and needs to be implemented in a clean optimized way.
  var router, matched;

// possible server-side option...
// router_id = $.couch.db("altermap").view("altermap/routerByMAC",{success: function(data){console.log(data.rows[0].id)}, keys:["01:35:5C:B3:73:D4"]});
//AlterMap.routers.where({'_id': router_id})
//return router

  for (var i=0; i<AlterMap.routers.length; i++){ 
    router = AlterMap.routers.at(i)
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

AlterMap.Community = Backbone.Model.extend({
  url : function() {
    return this.id ? '/communities/' + this.id : '/communities';
  },
  routerCount: function(){
  },
});

AlterMap.Router = Backbone.Model.extend({
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
    if (AlterMap.currentCommunity != null){
      if ( this.get('community') == AlterMap.currentCommunity.get('name')){
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
    AlterMap.vent.trigger("router:selected", this);
    },

    deselect: function(){
    this.unset("selected", {silent: true});
    this.trigger("deselected");
    }
  */
});

//-------- Collections

AlterMap.CommunityCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  comparator: function(collection){
    return(collection.get('name'));
  },
  url: "/communities",
  model: AlterMap.Community,

  initialize : function(){
    _.bindAll(this, 'select');
  },

  select: function(community_id){
    var community = AlterMap.communities.where({'_id': community_id})[0];
    AlterMap.currentCommunity = community;
  }
});

AlterMap.RouterCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  comparator: function(collection){
    return(collection.get('name'));
  },
  url: "/routers",
  model: AlterMap.Router,

  initialize : function(){
    _.bindAll(this, 'select');
  },

  select: function(router){
    AlterMap.currentRouter = router;
  }

});

//-------- Views 

AlterMap.CommunityOptionView = Backbone.Marionette.ItemView.extend({
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

AlterMap.CommunitySelectView = Backbone.Marionette.CompositeView.extend({
  itemView: AlterMap.CommunityOptionView,
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
    AlterMap.vent.trigger("community:selected", community_id)
  }
});

AlterMap.CommunityToolboxView = Backbone.Marionette.ItemView.extend({
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
    AlterMap.vent.trigger('router:add-new', AlterMap.currentCommunity.id);
  },
  exportKML: function(evt){
    AlterMap.vent.trigger('community:export-kml', AlterMap.currentCommunity.id);
  },
  render: function(){
    if(AlterMap.currentCommunity){
      $(this.el).html(this.template(
        {'community_id': AlterMap.currentCommunity.id,
         'community_name': AlterMap.currentCommunity.get('name')}));
    }
  }
});

AlterMap.CommunityExportKMLView = Backbone.Marionette.ItemView.extend({
  className: "modal",
  events: {
  },
  initialize: function(){
    this.template = _.template($("#community-export-kml").html());
  },
  render: function(){
    $(this.el).html(this.template(
      {'kml_data': AlterMap.Map.getKMLdata()}));
  }
})

AlterMap.RouterRowView = Backbone.Marionette.ItemView.extend({
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
    AlterMap.refreshRouterLinks(this.model)
  },
  selectRouter: function(evt){
//    evt.preventDefault();
    AlterMap.vent.trigger('router:selected', this.model.id);
  }
})

AlterMap.RouterListView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.RouterRowView,
  tagName: 'ul',
  id: 'routerlist',
  initialize : function(){
    this.collection.on("change", this.updateMarker);
    _.bindAll(this, 'updateMarker');
  },
  onItemAdded: function(itemView){
    // if a community is selected only show router markers for that community
    var router = itemView.model
    if (AlterMap.currentCommunity == null || router.isInCurrentCommunity()){
      if(router.get('coords')!=undefined){
        router.marker = AlterMap.Map.createRouterMarker(router);
      }
      else{
        console.log('unpositioned router '+ router.get('name') +', id: '+ router.id);
      }
    }
  },
  appendHtml: function(collectionView, itemView, index){
    // only show routers for the currently selected community
    if (AlterMap.currentCommunity == null || itemView.model.isInCurrentCommunity()){
        collectionView.$el.append(itemView.el);
    }
  },
  onItemRemoved: function(itemView){
    AlterMap.Map.removeRouterMarker(itemView.model);
  },
  onClose: function(){
    AlterMap.Map.resetMarkers();
    AlterMap.Map.resetLinkLines();
   },
  updateMarker: function(router){
    router.marker.destroy();
    router.marker = AlterMap.Map.createRouterMarker(router);
    AlterMap.refreshRouterLinks(router);
  }
});

AlterMap.RouterAddView = Backbone.Marionette.ItemView.extend({
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
      AlterMap.currentRouter = new AlterMap.Router({'name': routerName, 'community_id': AlterMap.currentCommunity.id});
      this.close();
      AlterMap.Map.drawRouterMarker();
    };
  }
/*
render: function(){
    $(this.el).html(this.template({'community': AlterMap.currentCommunity}));
  }
*/
});

AlterMap.RouterDetailView = Backbone.Marionette.ItemView.extend({
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
    AlterMap.Map.drawRouterMarker();
  },
  destroyCurrentRouter: function(){
    this.close();
    router_id = AlterMap.currentRouter.id
    AlterMap.vent.trigger('router:destroyed', router_id);
  },
  render: function(){
    var wifilinks = this.model.get('links') // TODO: should only get links of type "wifi"
    var linkList = [];
    
    if (wifilinks != undefined){
      wifilinks.forEach(function(wifilink){
        linkData  = wifilink;
        stationRouter = AlterMap.routerFromMAC(wifilink.attributes.station_mac)
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
//    AlterMap.currentRouter = null;
//    AlterMap.Map.unselectRouterMarker(this.model);
  }
});

//--------

AlterMap.selectCommunity = function(community_id){
  AlterMap.communities.select(community_id);
  // a new community has been selected, so we re-render the view
  AlterMap.sidebarMainRegion.close();
  var routerListView = new AlterMap.RouterListView({
    collection: AlterMap.routers
  });
  AlterMap.sidebarMainRegion.show(routerListView);

  AlterMap.Map.zoomToRouters();
  var communityToolboxView = new AlterMap.CommunityToolboxView();
  AlterMap.communityToolboxRegion.show(communityToolboxView);
}

AlterMap.exportKML = function(community_id){  
  AlterMap.modalRegion.show(new AlterMap.CommunityExportKMLView());
}

AlterMap.selectRouter = function(router_id){
  var router = AlterMap.routers.where({'_id': router_id})[0];
  AlterMap.routers.select(router);
  var routerDetail = new AlterMap.RouterDetailView({model: router});
  AlterMap.Map.selectRouterMarker(router);
  AlterMap.modalRegion.show(routerDetail);
}

AlterMap.addNewRouter = function(community_id){
  routerAddView = new AlterMap.RouterAddView();
  AlterMap.modalRegion.show(routerAddView);
}

AlterMap.saveRouterToCoords = function(router, coords){
  router.set({coords: coords});
  AlterMap.brokenRouter = router;
  router.save();
  if (router == AlterMap.currentRouter){
    AlterMap.currentRouter = null;
  }
}

AlterMap.destroyRouter = function(router_id){
  var router = AlterMap.routers.where({'_id': router_id})[0];
  router.destroy();
}

AlterMap.refreshRouterLinks = function(router){
    var wifilinks = router.get('links') // TODO: should only get links of type "wifi"
    if (wifilinks != undefined){
      wifilinks.forEach(function(wifilink){
        // only show links for the currently selected community
        if (router.isInCurrentCommunity()){
          linkData  = wifilink;
          stationRouter = AlterMap.routerFromMAC(wifilink.attributes.station_mac)
          if (stationRouter){
            linkData.source_coords = router.get('coords');
            linkData.target_coords = stationRouter.get('coords');

            if (wifilink.line == undefined){
              wifilink.line = AlterMap.Map.createLinkLine(linkData);
            }
            // if a link line exists, check if it's still current or recreate it
            else{
              if (wifilink.line.link == wifilink){
                AlterMap.Map.displayLinkLine(wifilink)
              }
              else {
                AlterMap.Map.removeLinkLine(wifilink.line);
                wifilink.line = AlterMap.Map.createLinkLine(wifilink)
              }
            }
          }
        }
      });
    }
}

AlterMap.setupCouch = function(db_name){
  Backbone.couch_connector.config.db_name = db_name;
  Backbone.couch_connector.config.ddoc_name = db_name;
  Backbone.couch_connector.config.single_feed = true;
  Backbone.couch_connector.config.global_changes = true;
}

AlterMap.addInitializer(function(options){
  if (options!=undefined){
    var db_name = options.db_name || 'altermap'
  }
  else var db_name = 'altermap';

  AlterMap.setupCouch(db_name);

  AlterMap.communities = new AlterMap.CommunityCollection();
  AlterMap.routers = new AlterMap.RouterCollection();

  var communitySelectView = new AlterMap.CommunitySelectView({collection: AlterMap.communities})
  AlterMap.globalToolboxRegion.show(communitySelectView);
  var routerListView = new AlterMap.RouterListView({collection: AlterMap.routers})
  AlterMap.sidebarMainRegion.show(routerListView);

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
    AlterMap.destroyRouter(router_id);
  });
  
  /*
    AlterMap.vent.on("router:selected", function(router){
    AlterMap.showRouter(router);
    router.navigate("routers/" + router.id);
    });
  */

  AlterMap.communities.fetch({success: function(){
    AlterMap.routers.fetch({success: function(){
        AlterMap.Map.zoomToRouters();
        if (AlterMap.communities.length==1){
          AlterMap.vent.trigger("community:selected", AlterMap.communities.at(0).id)
          AlterMap.globalToolboxRegion.close();
        }
    }});
  }});


});

AlterMap.on("initialize:after", function(){
//    Backbone.history.start();
});
