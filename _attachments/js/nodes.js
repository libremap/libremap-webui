Backbone.couch_connector.config.db_name = "altermap";
Backbone.couch_connector.config.ddoc_name = "altermap";
Backbone.couch_connector.config.global_changes = true;

// Enables Mustache.js-like templating.
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

var current_node = null;
/*
var dispatcher = _.clone(Backbone.Events)

dispatcher.on('setCurrentNode', function(node){
    current_node = node
    console.log('current'+ node.get('name'))
})
*/

var Node = Backbone.Model.extend({
    url : function() {
        // POST to '/nodes' and PUT to '/nodes/:id'
        return this.id ? '/nodes/' + this.id : '/nodes';
    },
    initialize : function(){
        _.bindAll(this, 'saveToCoords', 'setCurrent');
    },
    saveToCoords: function(coords){
        this.set({coords: coords});
        this.save({wait: true});
    },
    setCurrent: function(){
//        dispatcher.trigger('setCurrentNode', this);
    }
});

var NodesCollection = Backbone.Collection.extend({
    url: "/nodes",
    model: Node,
});

var NodeRowView = Backbone.View.extend({
    tagName: "div",
    className: "node-row",
    template : _.template($("#node-row-template").html()),

    events: {
        "click .node-row a": 'selectNode',
    },

    initialize : function(){
        _.bindAll(this, 'render', 'selectNode');
        this.model.bind('change', this.render);
    },
    render: function(){
        var content = this.model.toJSON();
        $(this.el).html(this.template(content));
        return this;
    },
    selectNode: function(){
        map.selectNodeMarker(this.model);
    },
})

var NodesListView = Backbone.View.extend({
    el: $('#sidebar'),

    initialize: function(collection){
        _.bindAll(this, 'refreshed', 'addRow');
        nodes.bind("reset", this.refreshed);
        nodes.bind("add", this.addRow);
    },
    addRow : function(node){
        var view = new NodeRowView({model: node});
        var rendered = view.render().el;
        $(this.el).append(rendered);
    },
    refreshed: function(){
        $("#sidebar").html("");
        nodes.each(this.addRow);
    }
});


var NodeMarkerView = Backbone.View.extend({
    initialize : function(){
        _.bindAll(this, 'render');
        //            this.model.bind('change', this.render);
    },
    render: function(){
        if (this.model.marker == undefined){
            this.model.marker = map.displayNodeMarker(this.model);
        }
    },
})

var NodeMarkersView =  Backbone.View.extend({
    initialize: function(collection){
        _.bindAll(this, 'addMarker', 'refreshed');
        nodes.bind("reset", this.refreshed, this);
        nodes.bind("add", this.addMarker);
    },
    addMarker : function(node){
        if (node.marker == undefined){
            var view = new NodeMarkerView({model: node});
            view.render();
        }
    },
    refreshed: function(){
        nodes.each(this.addMarker);
    }
});


var AddNodeView = Backbone.View.extend({
    el: $("#toolbox"),
    initialize: function(){
        _.bindAll(this, 'addNewNode', 'render');
        this.render()
    },
    render: function(){
        var template = _.template( $("#new-node-template").html(), {} );
        $(this.el).html( template );
    },
    events: {
        "click input#add-node": 'addNewNode',
    },
    addNewNode: function(e){
        new_node = new Node({name: $('#new-node-name').val()});
        map.positionNodeMarker(new_node);
    },

});

var nodes = new NodesCollection();

var NodesAppRouter = Backbone.Router.extend({
    routes: {
        "nodes/:id": "selectNode",
    },

    initialize : function(){
        nodes.fetch();
        new NodesListView(nodes);
        new NodeMarkersView(nodes);
        new AddNodeView();
    },
    selectNode: function(node_id){
        node = nodes.get(node_id);
        map.selectNodeMarker(node);
//        dispatcher.trigger('setCurrentNode', node);
    },
});
