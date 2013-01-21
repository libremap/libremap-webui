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
  console.log("initialized");

  var router = new AlterMap.Router({
    collection: nodes
  });

});


AlterMap.on("initialize:after", function(){
//  Backbone.history.start();
});
