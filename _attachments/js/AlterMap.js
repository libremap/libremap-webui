var AlterMap = new Backbone.Marionette.Application();


AlterMap.addRegions({
  mapRegion: "#map",
  sidebarRegion: "#sidebar",
  detailRegion: "#detail",
  statusRegion: "#status",
});


////////////////////////////// Models

AlterMap.Network = Backbone.Model.extend({
  url : function() {
    return this.id ? '/networks/' + this.id : '/networks';
  },

  nodeCount: function(){
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
  model: AlterMap.Network,
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
  template : null,

  initialize : function(){
    // we load the template here because they aren't ready at page load
    // because we get them through an ajax request
    this.template = _.template($("#network-option-template").html())
    _.bindAll(this, 'render');
  },
  render: function(){
    var content = this.model.toJSON();
    $(this.el).html(this.template(content));
  },
})

AlterMap.NetworkSelectView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.NetworkOptionView,
  el: $('#network-select'),

  initialize : function(){
    this.render();
  }
});


AlterMap.NodeRowView = Backbone.Marionette.ItemView.extend({
  tagName: "li",
  className: "node-row",
  template : null,

  initialize : function(){
    // we load the template here because they aren't ready at page load
    // because we get them through an ajax request
    this.template = _.template($("#node-row-template").html())
    _.bindAll(this, 'render');
  },
  render: function(){
    var content = this.model.toJSON();
    $(this.el).html(this.template(content));
    return this;
  },
})

AlterMap.NodeListView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.NodeRowView,
  el: $('#nodelist'),

  initialize : function(){
    this.render();
  },
});

////////////////////////////// 

AlterMap.Router = Backbone.Router.extend({
  routes: {
  }
});


AlterMap.addInitializer(function(options){
  if (options!=undefined){
    var db_name = options.db_name || 'altermap'
  }
  else var db_name = 'altermap';

  Backbone.couch_connector.config.db_name = db_name;
  Backbone.couch_connector.config.ddoc_name = db_name;
  
  Backbone.couch_connector.config.single_feed = true;
  Backbone.couch_connector.config.global_changes = true;  

  // Enables Mustache.js-like templating.
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }


  var nodes = new AlterMap.NodeCollection();
  var networks = new AlterMap.NetworkCollection();
  
  /*
    nodes.on("add", function(node){
    AlterMap.addNode(node);
    });

    AlterMap.vent.on("node:selected", function(node){
    AlterMap.showNode(node);
    router.navigate("nodes/" + node.id);
    });

    var nodeListView = new AlterMap.NodeListView({
    collection: nodes
    });
    nodeListView.render();

    $("#node-list").html(nodeListView.el);
  */

  var networkSelectView = new AlterMap.NetworkSelectView({collection: networks})
  var nodeListView = new AlterMap.NodeListView({collection: nodes})

  var node_router = new AlterMap.Router({
    collection: nodes
  });
//  nodes.fetch();

  var network_router = new AlterMap.Router({
    collection: networks
  });
//  networks.fetsch();

});

AlterMap.on("initialize:after", function(){
  //  Backbone.history.start();
});
