Backbone.couch_connector.config.db_name = "altermap";
Backbone.couch_connector.config.ddoc_name = "altermap";
Backbone.couch_connector.config.global_changes = false;


// Enables Mustache.js-like templating.
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

var CURRENT_NODE = null;


var WifiLink = Backbone.Model.extend({
    url : function() {
        return this.id ? '/wifilinks/' + this.id : '/wifilinks';
    },   
});

var WifiLinksCollection = Backbone.Collection.extend({
    db : {
      changes : true
    },
    url: "/wifilinks",
    model: WifiLink,
});

var LinkLineView = Backbone.View.extend({
    initialize : function(){
        _.bindAll(this, 'render', 'remove', '_nodeFromMAC');
        this.model.on('remove', this.remove);
    },
    _nodeFromMAC: function (macaddr){
        var iface = interfaces.where({'macaddr':macaddr})[0];
        var device = devices.get(iface.get('device_id'));
        console.log("Device id: "+ iface.get('device_id') + " | Device obj: "+ device);
        var node = nodes.where({'_id': device.get('node_id')})[0]
        return node;        
    },

    render: function(){
        var source_node = this._nodeFromMAC(this.model.get('macaddr'));
        var target_node = this._nodeFromMAC(this.model.get('station'));
        this.model.source_coords = source_node.get('coords');
        this.model.target_coords = target_node.get('coords');
        if (this.model.line == undefined){
            this.model.line = map.displayLinkLine(this.model);
        }
    },
    remove: function(){
        map.removeLinkLine(this.model.line);
    },
})

var WifiLinksView =  Backbone.View.extend({
    initialize: function(collection){
        _.bindAll(this, 'addLine', 'refreshed');
        wifilinks.on("reset", this.refreshed, this);
        wifilinks.on("add", this.addLine);
    },
    addLine : function(wifilink){
        if (wifilink.line == undefined){
            var view = new LinkLineView({model: wifilink});
            view.render();
        }
    },
    refreshed: function(){
        wifilinks.each(this.addLine);
    }
});


var Network = Backbone.Model.extend({
    url : function() {
        return this.id ? '/networks/' + this.id : '/networks';
    },   
});

var NetworksCollection = Backbone.Collection.extend({
    url: "/networks",
    model: Network,
});

var Zone = Backbone.Model.extend({
    url : function() {
        return this.id ? '/zones/' + this.id : '/zones';
    },   
});

var ZonesCollection = Backbone.Collection.extend({
    url: "/zones",
    model: Zone,
});

var Node = Backbone.Model.extend({
    url : function() {
        // POST to '/nodes' and PUT to '/nodes/:id'
        return this.id ? '/nodes/' + this.id : '/nodes';
    },
});

var NodesCollection = Backbone.Collection.extend({
    db : {
      changes : true
    },
    url: "/nodes",
    model: Node,
});

var Device = Backbone.Model.extend({
    db : {
      changes : true
    },
    url : function() {
        return this.id ? '/devices/' + this.id : '/devices';
    },   
});

var DevicesCollection = Backbone.Collection.extend({
    url: "/devices",
    model: Device,
});

var Interface = Backbone.Model.extend({
    url : function() {
        return this.id ? '/interfaces/' + this.id : '/interfaces';
    },   
});

var InterfacesCollection = Backbone.Collection.extend({
    db : {
      changes : true
    },
    url: "/interfaces",
    model: Interface,
});

var NodeRowView = Backbone.View.extend({
    tagName: "div",
    className: "node-row",
    template : _.template($("#node-row-template").html()),

    events: {
        "click .node-row a": 'selectNode',
    },

    initialize : function(){
        _.bindAll(this, 'render', 'selectNode', 'remove');
        this.model.on('change', this.render);
        this.model.on('remove', this.remove);
    },
    render: function(){
        var content = this.model.toJSON();
        $(this.el).html(this.template(content));
        return this;
    },
    remove: function(){
        $(this.el).remove();
    },
    selectNode: function(){
        map.selectNodeMarker(this.model.marker);
    },
})

var NodesListView = Backbone.View.extend({
    el: $('#sidebar'),

    initialize: function(collection){
        _.bindAll(this, 'refreshed', 'addRow');
        nodes.on("reset", this.refreshed);
        nodes.on("add", this.addRow);
        this._viewPointers = [];
    },
    addRow : function(node){
        var view = new NodeRowView({model: node});
        var rendered = view.render().el;
        this._viewPointers[node.cid] = view;
        $(this.el).append(rendered);
    },

    refreshed: function(){
        $("#sidebar").html("");
        nodes.each(this.addRow);
    }
});


var NodeMarkerView = Backbone.View.extend({
    initialize : function(){
        _.bindAll(this, 'render', 'remove');
        this.model.on('remove', this.remove);
        
        //            this.model.on('change', this.render);
    },
    render: function(){
        if (this.model.marker == undefined){
            this.model.marker = map.displayNodeMarker(this.model);
        }
    },
    remove: function(){
        map.removeNodeMarker(this.model.marker);
    },
})

var NodeMarkersView =  Backbone.View.extend({
    initialize: function(collection){
        _.bindAll(this, 'addMarker', 'refreshed');
        nodes.on("reset", this.refreshed, this);
        nodes.on("add", this.addMarker);
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
        CURRENT_NODE = new_node;
        map.drawNodeMarker(new_node);
    },

});

var networks = new NetworksCollection();
var zones = new ZonesCollection()
var nodes = new NodesCollection();
var devices = new DevicesCollection();
var interfaces = new InterfacesCollection();
var wifilinks = new WifiLinksCollection();

var NodesAppRouter = Backbone.Router.extend({
    routes: {
        "nodes/:id": "selectNode",
    },

    initialize : function(){
        networks.fetch({success: function(){
            console.log('networks loaded');
            zones.fetch({success: function(){
                console.log('zones loaded');
                nodes.fetch({success: function(){
                    console.log('nodes loaded');
                    devices.fetch({success: function(){
                        console.log('devices loaded');
                        interfaces.fetch({success: function(){
                            console.log('interfaces loaded');
                            wifilinks.fetch({success: function(){
                                console.log('wifilinks loaded');
                            }});
                        }});
                    }});
                }});
            }});
        }});

        new NodesListView(nodes);
        new NodeMarkersView(nodes);
        new AddNodeView();
        new WifiLinksView(wifilinks);

    },
    selectNode: function(node_id){
        console.log('select by URL');
    },
});
