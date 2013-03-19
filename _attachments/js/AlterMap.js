var AlterMap = new Backbone.Marionette.Application();

AlterMap.currentNetwork = null;
AlterMap.currentZone = null;

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
  nodeCount: function(){
  },
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

  initialize : function(){
    _.bindAll(this, 'isInCurrentZone');
  },

  isInCurrentZone: function(){
    if (AlterMap.currentZone != null){
      if (this.get('zone_id') == AlterMap.currentZone.id){
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

AlterMap.WifiLink = Backbone.Model.extend({
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
  model: AlterMap.Network,

  initialize : function(){
    _.bindAll(this, 'select');
  },

  select: function(network_id){
    // temporary hack until zone selection is implemented
    var network = AlterMap.networks.where({'_id': network_id})[0];
    var selected_zone = AlterMap.zones.where({'network_id': network_id})[0];
    if (selected_zone == undefined){
      AlterMap.currentNetwork = null;
      console.error('Selected network has no zones defined');
    }
    else {
      AlterMap.currentNetwork = network;
      AlterMap.currentZone = selected_zone;
    }  
  }
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

AlterMap.WifiLinkCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  url: "/wifilinks",
  model: AlterMap.WifiLink,
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
  },
  select: function(){
    network_id = $(this.el).val();
    AlterMap.vent.trigger("network:selected", network_id)
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
  },
})

AlterMap.NodeListView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.NodeRowView,
  el: $('#nodelist'),

  onItemAdded: function(itemView){
    // only show nodes for the currently selected zone
    if (AlterMap.currentZone == null || itemView.model.isInCurrentZone()){
      itemView.model.marker = AlterMap.Map.displayNodeMarker(itemView.model);
    }
  },
  appendHtml: function(collectionView, itemView, index){
    // only show nodes for the currently selected zone
    if (AlterMap.currentZone == null || itemView.model.isInCurrentZone()){
        collectionView.$el.append(itemView.el);
    }
  },
/*
  onItemRemoved: function(itemView){
    AlterMap.Map.removeNodeMarker(itemView.model);
  },
*/
  onClose: function(){
    AlterMap.Map.resetMarkers();
  }
});

AlterMap.LinkLineView = Backbone.Marionette.ItemView.extend({
  initialize : function(){
    _.bindAll(this, '_nodeFromMAC');
  },
  _nodeFromMAC: function (macaddr){
    var iface = AlterMap.interfaces.where({'macaddr': macaddr})[0];
    if (iface != undefined ){
      var device = AlterMap.devices.get(iface.get('device_id'));
      var node = AlterMap.nodes.where({'_id': device.get('node_id')})[0]
      return node;
    }
  },

  render: function(){
    var source_node = this._nodeFromMAC(this.model.get('macaddr'));
    var target_node = this._nodeFromMAC(this.model.get('station'));
    if (source_node != undefined && target_node != undefined){
      if (AlterMap.currentZone == null ||
          (source_node.isInCurrentZone() || target_node.isInCurrentZone())
         ){
        
        this.model.source_coords = source_node.get('coords');
        this.model.target_coords = target_node.get('coords');
        if (this.model.line == undefined){
          this.model.line = AlterMap.Map.displayLinkLine(this.model);
        }
      }
    }
  },
})

AlterMap.WifiLinksView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.LinkLineView,
/*
  onItemRemoved: function(itemView){
    AlterMap.Map.removeLinkLine(itemView.model);
  },
*/
  onClose: function(){
    AlterMap.Map.resetLinkLines();
  }
});


////////////////////////////// 


AlterMap.selectNetwork = function(network_id){
  AlterMap.networks.select(network_id)
  if (AlterMap.sidebarMainRegion.currentView instanceof AlterMap.NodeListView){
    // a new network has been selected, so we refresh the view
    AlterMap.sidebarMainRegion.show(AlterMap.sidebarMainRegion.currentView);
  }
  else{
    var nodeListView = new AlterMap.NodeListView({
      collection: AlterMap.nodes
    });
    AlterMap.sidebarMainRegion.show(nodeListView);
  }
  AlterMap.Map.resetLinkLines();
  AlterMap.wifilinks.fetch();
  AlterMap.Map.zoomToNodes();
}

AlterMap.addNodeMarker = function(node){
  console.log('added node marker for '+ node.get('name'));
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
  AlterMap.devices = new AlterMap.DeviceCollection();
  AlterMap.interfaces = new AlterMap.InterfaceCollection();
  AlterMap.wifilinks = new AlterMap.WifiLinkCollection();

  var networkSelectView = new AlterMap.NetworkSelectView({collection: AlterMap.networks})
  var nodeListView = new AlterMap.NodeListView({collection: AlterMap.nodes})
  AlterMap.sidebarMainRegion.show(nodeListView);
  
  AlterMap.wifiLinksView = new AlterMap.WifiLinksView({collection: AlterMap.wifilinks});

  AlterMap.vent.bind("network:selected", function(network_id){
    AlterMap.selectNetwork(network_id);
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

  AlterMap.networks.fetch({success: function(){
    AlterMap.zones.fetch({success: function(){
      AlterMap.nodes.fetch({success: function(){
        AlterMap.devices.fetch({success: function(){
          AlterMap.interfaces.fetch({success: function(){
            AlterMap.wifilinks.fetch({success: function(){
              AlterMap.Map.zoomToNodes();
            }});
          }});
        }});
      }});
    }});
  }});

});

AlterMap.on("initialize:after", function(){
//    Backbone.history.start();
});
