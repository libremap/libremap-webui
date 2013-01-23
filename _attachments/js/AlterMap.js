var AlterMap = new Backbone.Marionette.Application();


AlterMap.addRegions({
  mapRegion: "#map",
  sidebarRegion: "#sidebar",
  detailRegion: "#detail",
  statusRegion: "#status",
});

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


AlterMap.Router = Backbone.Router.extend({
  routes: {
  }
});


AlterMap.addInitializer(function(options){

  Backbone.couch_connector.config.db_name = "altermap";
  Backbone.couch_connector.config.ddoc_name = "altermap";
  
  Backbone.couch_connector.config.single_feed = true;
  Backbone.couch_connector.config.global_changes = true;  

  // Enables Mustache.js-like templating.
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  }


  var nodes = new AlterMap.NodeCollection();

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
  var router = new AlterMap.Router({
    collection: nodes
  });

});

AlterMap.on("initialize:after", function(){
//  Backbone.history.start();
});
