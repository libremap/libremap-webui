var AlterMap = new Backbone.Marionette.Application();

AlterMap.currentNetwork = null;
AlterMap.currentZone = null;
AlterMap.collections = {};

AlterMap.addRegions({
  mapRegion: "#map",
  sidebarRegion: "#sidebar",
  sidebarTopRegion: "#sidebar-top",
  sidebarMainRegion: "#sidebar-main",
  detailRegion: "#detail",
  statusRegion: "#status",
});


////////////////////////////// Models

AlterMap.Network = Backbone.Model.extend({
  url : function() {
    return this.id ? '/networks/' + this.id : '/networks';
  },
  initialize : function(){
    _.bindAll(this, 'select');
  },

  nodeCount: function(){
  },

  select: function(){
    if (this.selected!=true){
//      this.set({selected: true}, {silent: true});
      AlterMap.currentNetwork = this;
      AlterMap.vent.trigger("network:selected", this);
    }
  }
});

AlterMap.Zone = Backbone.Model.extend({
  url : function() {
    return this.id ? '/zones/' + this.id : '/zones';
  },
});

AlterMap.Node = Backbone.Model.extend({
  url : function() {
    // POST to '/nodes' and PUT to '/nodes/:id'
    return this.id ? '/nodes/' + this.id : '/nodes';
  },

  /*
    select: function(){
    if (!this.get("selected")){
    this.set({selected: true}, {silent: true});
    this.trigger("selected");
    this.collection.select(this);
    }
    AlterMap.vent.trigger("node:selected", this);
    },

    deselect: function(){
    this.unset("selected", {silent: true});
    this.trigger("deselected");
    }
  */
});

AlterMap.Device = Backbone.Model.extend({
  url : function() {
    return this.id ? '/devices/' + this.id : '/devices';
  },
});

AlterMap.Interface = Backbone.Model.extend({
  url : function() {
    return this.id ? '/interfaces/' + this.id : '/interfaces';
  },
});

AlterMap.Wifilink = Backbone.Model.extend({
  url : function() {
    return this.id ? '/wifilinks/' + this.id : '/wifilinks';
  },
});

////////////////////////////// Collections

AlterMap.NetworkCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  url: "/networks",
  model: AlterMap.Network
});

AlterMap.ZoneCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  url: "/zones",
  model: AlterMap.Zone,
});

AlterMap.NodeCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  url: "/nodes",
  model: AlterMap.Node,

  initialize : function(){
    _.bindAll(this, 'resetToNetwork');
  },

  resetToNetwork: function(network){
    // temporary hack until zone selection is implemented
    var zone = AlterMap.zones.where({network_id: AlterMap.currentNetwork.id})[0];
    AlterMap.currentZone = AlterMap.zones.where({network_id: AlterMap.currentNetwork.id})[0];
    if (AlterMap.currentZone == undefined){
      AlterMap.currentNetwork = null;
      console.error('Selected network has no zones defined');
      this.reset();
    }
    else {
      this.fetch({
        success: function(nodes){
          zone_nodes = nodes.where({'zone_id': AlterMap.currentZone.id});
          nodes.reset(zone_nodes);
        },
      });
    }  
  }
});

AlterMap.DeviceCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  url: "/devices",
  model: AlterMap.Device,
});

AlterMap.InterfaceCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  url: "/interfaces",
  model: AlterMap.Interface,
});

AlterMap.WifilinkCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  url: "/wifilinks",
  model: AlterMap.Wifilink,
});

////////////////////////////// Views 

AlterMap.NetworkOptionView = Backbone.Marionette.ItemView.extend({
  tagName: "option",
  className: "network-option",

  initialize : function(){
    _.bindAll(this, 'render');
  },
  render: function(){
    $(this.el).html(this.model.get('name'));
    $(this.el).attr('value', this.model.id);
  },
})

AlterMap.NetworkSelectView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.NetworkOptionView,
  el: $('#network-select'),
  events: {
    'change': 'select'
  },
  initialize : function(){
    _.bindAll(this, 'select');
    this.render();
  },
  select: function(){
    network_id = $(this.el).val();
    var network = AlterMap.networks.where({'_id': network_id})[0];
    network.select();
  }
});


AlterMap.NodeRowView = Backbone.Marionette.ItemView.extend({
  tagName: "li",
  className: "node-row",

  initialize : function(){
    // we load the template here because they aren't ready at page load
    // because we get them through an ajax request
    this.template = _.template($("#node-row-template").html())
    _.bindAll(this, 'render');
  },
  render: function(){
    var content = this.model.toJSON();
    $(this.el).html(this.template(content));
//    return this;
  },
})

AlterMap.NodeListView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.NodeRowView,
  el: $('#nodelist'),

  initialize : function(){
    this.render();
  },
  onItemAdded: function(itemView){
    itemView.model.marker = AlterMap.Map.displayNodeMarker(itemView.model);
  },
/*
  onItemRemoved: function(itemView){
    console.log('removing............');
    AlterMap.Map.removeNodeMarker(itemView.model);
  },
  onClose: function(){
    console.log('resetting ............');
    AlterMap.Map.resetMarkers();
  }
*/
});

////////////////////////////// 


AlterMap.showNetwork = function(network){
  AlterMap.nodes.resetToNetwork(network);
  var nodeListView = new AlterMap.NodeListView({
    collection: AlterMap.nodes
  });
  AlterMap.sidebarMainRegion.show(nodeListView);
}

AlterMap.addNodeMarker = function(node){
  console.log('added node '+ node.get('name'));
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

  // Enables Mustache.js-like templating.
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }

  AlterMap.networks = new AlterMap.NetworkCollection();
  AlterMap.zones = new AlterMap.ZoneCollection();
  AlterMap.nodes = new AlterMap.NodeCollection();

  var networkSelectView = new AlterMap.NetworkSelectView({collection: AlterMap.networks})
  var nodeListView = new AlterMap.NodeListView({collection: AlterMap.nodes})
  AlterMap.sidebarMainRegion.show(nodeListView);

  AlterMap.vent.bind("network:selected", function(network){
    AlterMap.showNetwork(network);
  });

  /*
    AlterMap.nodes.on("add", function(node){
    AlterMap.addNodeMarker(node);
    });

    AlterMap.vent.on("node:selected", function(node){
    AlterMap.showNode(node);
    router.navigate("nodes/" + node.id);
    });
  */

  AlterMap.networks.fetch();
  AlterMap.zones.fetch();
  AlterMap.nodes.fetch();

});

AlterMap.on("initialize:after", function(){
//    Backbone.history.start();
});
