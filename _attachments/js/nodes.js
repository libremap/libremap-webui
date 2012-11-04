Backbone.couch_connector.config.db_name = "altermap";
Backbone.couch_connector.config.ddoc_name = "altermap";
Backbone.couch_connector.config.global_changes = false;

// setup array-query  / https://npmjs.org/package/array-query
//Backbone.Collection.prototype.query = function(field) {
//    return query.select(@models).where(field);
//}

// Enables Mustache.js-like templating.
_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

var CURRENT_NODE = null;
/*
var dispatcher = _.clone(Backbone.Events)

dispatcher.on('setCurrentNode', function(node){
    current_node = node
    console.log('current'+ node.get('name'))
})
*/

// var BatmanLink = Backbone.Model.extend({
// });

// var BatmanLinks = Backbone.Collection.extend({
// //    url: "http://10.5.1.1:8000/ql_2012-10-13-T.json",
//     model: BatmanLink,
//     parse: function(response){
//         response.each(function(row){
//             console.log('row content'+ row[0]);
//         });
//     }
// });

//bl = new BatmanLinks();
//bl.fetch();

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
        this.model.bind('remove', this.remove);
        //            this.model.bind('change', this.render);
    },
    _nodeFromMAC: function (macaddr){
        var iface = interfaces.where({'macaddr':macaddr})[0];
        var device = devices.where({'_id': iface.get('device_id')})[0];
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
        map.removeLinkLine(this.model.lilne);
    },
})

var WifiLinksView =  Backbone.View.extend({
    initialize: function(collection){
        _.bindAll(this, 'addLine', 'refreshed');
        wifilinks.bind("reset", this.refreshed, this);
        wifilinks.bind("add", this.addLine);
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
/*
    initialize : function(){
        _.bindAll(this, 'saveToCoords');
    },
    saveToCoords: function(coords){
        this.set({coords: coords});
        this.save({wait: true});
    },
*/
});

var NodesCollection = Backbone.Collection.extend({
    db : {
      changes : true
    },
    url: "/nodes",
    model: Node,
    // byMac: function(mac) {
    //     return this.filter(function(mac) {
    //         return task.get('list') == null;
    //     });
    // },
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
        this.model.bind('change', this.render);
        this.model.bind('remove', this.remove);
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
        nodes.bind("reset", this.refreshed);
        nodes.bind("add", this.addRow);
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
        this.model.bind('remove', this.remove);
        
        //            this.model.bind('change', this.render);
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
                                console.log('wifilinks '+wifilinks.models);
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
        // nodes.fetch({success: function(){
        //     map.selectNodeMarker(node.marker);
        // }});
        // map.nodeSelector.unselectAll();
        // var node = nodes.get(node_id);
        // map.selectNodeMarker(node.marker);
////        dispatcher.trigger('setCurrentNode', node);
    },
});
