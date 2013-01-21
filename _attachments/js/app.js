$(function(){
  // Fill this with your database information.
  // `ddoc_name` is the name of your couchapp project.
  Backbone.couch_connector.config.db_name = "altermap";
  Backbone.couch_connector.config.ddoc_name = "altermap";
  
  // If set to true, the connector will listen to the changes feed
  // and will provide your models with real time remote updates.
  // But in this case we enable the changes feed for each Collection on our own.
  Backbone.couch_connector.config.global_changes = false;


Backbone.couch_connector.config.single_feed = true;
Backbone.couch_connector.config.global_changes = true;  

  // Enables Mustache.js-like templating.
  _.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
  };


   // set your models here
    
   var App = Backbone.Router.extend({
    initialize : function(){
    
    }
  });
});
