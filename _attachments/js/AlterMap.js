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

AlterMap.currentNetwork = null;
AlterMap.currentNode = null;

AlterMap.addRegions({
  mapRegion: "#map",
  sidebarRegion: "#sidebar",
  sidebarTopRegion: "#sidebar-top",
  sidebarMainRegion: "#sidebar-main",
  globalToolboxRegion: "#global-toolbox",
  networkToolboxRegion: "#network-toolbox",
//  nodeToolboxRegion: "#node-toolbox",
  statusRegion: "#status",
  modalRegion: ModalRegion
});


AlterMap.nodeFromMAC = function (macaddr){
//TODO: this does not scale at all and needs to be implemented in a clean optimized way.
  var node, devices, matched;

//node_id = $.couch.db("altermap").view("altermap/nodeByMAC",{success: function(data){console.log(data.rows[0].id)}, keys:["01:35:5C:B3:73:D4"]});
//AlterMap.nodes.where({'_id': node_id})
//return node

  for (var i=0; i<AlterMap.nodes.length; i++){ 
    node = AlterMap.nodes.at(i)
    devices = node.get('devices')
    if (devices!=undefined){
      devices.forEach(function(device){
        ifaces = device.interfaces;
        ifaces.forEach(function(iface){
          if(iface.macaddr==macaddr){
            matched = true;
          }
        });
      });
    }
    if(matched==true){
      return node
    }
  }
}

//-------- Models

AlterMap.Network = Backbone.Model.extend({
  url : function() {
    return this.id ? '/networks/' + this.id : '/networks';
  },
  nodeCount: function(){
  },
});

AlterMap.Node = Backbone.Model.extend({
  url : function() {
    // POST to '/nodes' and PUT to '/nodes/:id'
    return this.id ? '/nodes/' + this.id : '/nodes';
  },

  save: function(attrs, options) {
  // remove the line attribute from node links before saving. It should not be persisted.
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
    _.bindAll(this, 'isInCurrentNetwork');
  },

  isInCurrentNetwork: function(){
    if (AlterMap.currentNetwork != null){
      if (this.get('network_id') == AlterMap.currentNetwork.id){
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

//-------- Collections

AlterMap.NetworkCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  comparator: function(collection){
    return(collection.get('name'));
  },
  url: "/networks",
  model: AlterMap.Network,

  initialize : function(){
    _.bindAll(this, 'select');
  },

  select: function(network_id){
    var network = AlterMap.networks.where({'_id': network_id})[0];
    AlterMap.currentNetwork = network;
  }
});

AlterMap.NodeCollection =  Backbone.Collection.extend({
  db : {
    changes : true
  },
  comparator: function(collection){
    return(collection.get('name'));
  },
  url: "/nodes",
  model: AlterMap.Node,

  initialize : function(){
    _.bindAll(this, 'select');
  },

  select: function(node){
    AlterMap.currentNode = node;
  }

});

//-------- Views 

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

AlterMap.NetworkSelectView = Backbone.Marionette.CompositeView.extend({
  itemView: AlterMap.NetworkOptionView,
  itemViewContainer: "select",
  events: {
    'change': 'select'
  },
  initialize: function(){
    this.template = _.template($('#network-select').html());
    _.bindAll(this, 'select');
  },
  onRender: function(){
    // hacky way to add an empty option as first element
    if (!$('.empty-network-option', this.el).length>0){
      empty_option = new Option('----','',true,true);
      $(empty_option).addClass('empty-network-option');
      $('#network-select', this.el).prepend(empty_option);
    }
  },
  select: function(){
    network_id = $('#network-select', this.el).val();
    AlterMap.vent.trigger("network:selected", network_id)
  }
});

AlterMap.NetworkToolboxView = Backbone.Marionette.ItemView.extend({
//  id: 'network-toolbox',
//  className: 'toolbox',
  events: {
    'click #add-node-link': 'addNode',
    'click #export-kml-link': 'exportKML',

  },
  initialize : function(){
    this.template = _.template($('#network-toolbox-template').html());
    _.bindAll(this, 'addNode', 'exportKML');
  },
  addNode: function(evt){
//    evt.preventDefault();
    AlterMap.vent.trigger('node:add-new', AlterMap.currentNetwork.id);
  },
  exportKML: function(evt){
    AlterMap.vent.trigger('network:export-kml', AlterMap.currentNetwork.id);
  },
  render: function(){
    if(AlterMap.currentNetwork){
      $(this.el).html(this.template(
        {'network_id': AlterMap.currentNetwork.id,
         'network_name': AlterMap.currentNetwork.get('name')}));
    }
  }
});

AlterMap.NetworkExportKMLView = Backbone.Marionette.ItemView.extend({
  className: "modal",
  events: {
  },
  initialize: function(){
    this.template = _.template($("#network-export-kml").html());
  },
  render: function(){
    $(this.el).html(this.template(
      {'kml_data': AlterMap.Map.getKMLdata()}));
  }
})

AlterMap.NodeRowView = Backbone.Marionette.ItemView.extend({
  tagName: "li",
  className: "node-row",
  events: {
    "click": "selectNode"
  },
  initialize: function(){
    // we load the template here because they aren't ready at page load
    // because we get them through an ajax request
    this.template = _.template($("#node-row-template").html())
    _.bindAll(this, 'selectNode');

  },
  render: function(){
    var content = this.model.toJSON();
    $(this.el).html(this.template(content));
    AlterMap.refreshNodeLinks(this.model)
  },
  selectNode: function(evt){
//    evt.preventDefault();
    AlterMap.vent.trigger('node:selected', this.model.id);
  }
})

AlterMap.NodeListView = Backbone.Marionette.CollectionView.extend({
  itemView: AlterMap.NodeRowView,
  tagName: 'ul',
  id: 'nodelist',
  initialize : function(){
    this.collection.on("change", this.updateMarker);
    _.bindAll(this, 'updateMarker');
  },
  onItemAdded: function(itemView){
    // if a network is selected only show node markers for that network
    var node = itemView.model
    if (AlterMap.currentNetwork == null || node.isInCurrentNetwork()){
      if(node.get('coords')!=undefined){
        node.marker = AlterMap.Map.createNodeMarker(node);
      }
      else{
        console.log('unpositioned node '+ node.get('name') +', id: '+ node.id);
      }
    }
  },
  appendHtml: function(collectionView, itemView, index){
    // only show nodes for the currently selected network
    if (AlterMap.currentNetwork == null || itemView.model.isInCurrentNetwork()){
        collectionView.$el.append(itemView.el);
    }
  },
  onItemRemoved: function(itemView){
    AlterMap.Map.removeNodeMarker(itemView.model);
  },
  onClose: function(){
    AlterMap.Map.resetMarkers();
    AlterMap.Map.resetLinkLines();
   },
  updateMarker: function(node){
    node.marker.destroy();
    node.marker = AlterMap.Map.createNodeMarker(node);
    AlterMap.refreshNodeLinks(node);
  }
});

AlterMap.NodeAddView = Backbone.Marionette.ItemView.extend({
  className: "modal",
  events: {
    'click #pick-coords': 'pickCoords'
  },
  initialize: function(){
    this.template = _.template($("#node-add-template").html());
    _.bindAll(this, 'pickCoords');
  },
  pickCoords: function(){
    nodeName = $('#new-node-form #node_name').val();
    if (nodeName!=""){
      AlterMap.currentNode = new AlterMap.Node({'name': nodeName, 'network_id': AlterMap.currentNetwork.id});
      this.close();
      AlterMap.Map.drawNodeMarker();
    };
  }
/*
render: function(){
    $(this.el).html(this.template({'network': AlterMap.currentNetwork}));
  }
*/
});

AlterMap.NodeDetailView = Backbone.Marionette.ItemView.extend({
  className: "modal",
  events: {
    'click #new-placement': 'newPlacement',
    'click #delete-node': 'destroyCurrentNode'
  },
  initialize: function(){
    this.template = _.template($("#node-detail-template").html());
    _.bindAll(this, 'newPlacement', 'destroyCurrentNode');
  },
  newPlacement: function(){
    this.close();
    AlterMap.Map.drawNodeMarker();
  },
  destroyCurrentNode: function(){
    this.close();
    node_id = AlterMap.currentNode.id
    AlterMap.vent.trigger('node:destroyed', node_id);
  },
  render: function(){
    var devices = this.model.get('devices')
    var wifilinks = this.model.get('links') // TODO: should only get links of type "wifi"
    var linkList = [];
    
    if (wifilinks != undefined){
      wifilinks.forEach(function(wifilink){
        linkData  = wifilink;
        stationNode = AlterMap.nodeFromMAC(wifilink.attributes.station_mac)
        iface_prefix = wifilink.attributes.interface +": "
        if (stationNode != undefined){
          linkData['station_name'] = iface_prefix + stationNode.get("name");
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
    $(this.el).html(this.template({'node': this.model.toJSON(), 'devices': devices, 'links': linkList}));
  },
  onClose: function(){
// TODO: this view is getting instantiated and closed more than once. Need to investigate
//    AlterMap.currentNode = null;
//    AlterMap.Map.unselectNodeMarker(this.model);
  }
});

//--------

AlterMap.selectNetwork = function(network_id){
  AlterMap.networks.select(network_id);
  // a new network has been selected, so we re-render the view
  AlterMap.sidebarMainRegion.close();
  var nodeListView = new AlterMap.NodeListView({
    collection: AlterMap.nodes
  });
  AlterMap.sidebarMainRegion.show(nodeListView);

  AlterMap.Map.zoomToNodes();
  var networkToolboxView = new AlterMap.NetworkToolboxView();
  AlterMap.networkToolboxRegion.show(networkToolboxView);
}

AlterMap.exportKML = function(network_id){  
  AlterMap.modalRegion.show(new AlterMap.NetworkExportKMLView());
}

AlterMap.selectNode = function(node_id){
  var node = AlterMap.nodes.where({'_id': node_id})[0];
  AlterMap.nodes.select(node);
  var nodeDetail = new AlterMap.NodeDetailView({model: node});
  AlterMap.Map.selectNodeMarker(node);
  AlterMap.modalRegion.show(nodeDetail);
}

AlterMap.addNewNode = function(network_id){
  nodeAddView = new AlterMap.NodeAddView();
  AlterMap.modalRegion.show(nodeAddView);
}

AlterMap.saveNodeToCoords = function(node, coords){
  node.set({coords: coords});
  AlterMap.brokenNode = node;
  node.save();
  if (node == AlterMap.currentNode){
    AlterMap.currentNode = null;
  }
}

AlterMap.refreshNodeLinks = function(node){
    var wifilinks = node.get('links') // TODO: should only get links of type "wifi"
    if (wifilinks != undefined){
      wifilinks.forEach(function(wifilink){
        // only show links for the currently selected network
        if (node.isInCurrentNetwork()){
          linkData  = wifilink;
          stationNode = AlterMap.nodeFromMAC(wifilink.attributes.station_mac)
          if (stationNode){
            linkData.source_coords = node.get('coords');
            linkData.target_coords = stationNode.get('coords');

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

  AlterMap.networks = new AlterMap.NetworkCollection();
  AlterMap.nodes = new AlterMap.NodeCollection();

  var networkSelectView = new AlterMap.NetworkSelectView({collection: AlterMap.networks})
  AlterMap.globalToolboxRegion.show(networkSelectView);
  var nodeListView = new AlterMap.NodeListView({collection: AlterMap.nodes})
  AlterMap.sidebarMainRegion.show(nodeListView);

  AlterMap.vent.on("network:selected", function(network_id){
    AlterMap.selectNetwork(network_id);
  });

  AlterMap.vent.on("network:export-kml", function(network_id){
    AlterMap.exportKML(network_id);
  });

  AlterMap.vent.on("node:selected", function(node_id){
    AlterMap.selectNode(node_id);
  });

  AlterMap.vent.on("node:add-new", function(network_id){
    AlterMap.addNewNode(network_id);
  });

  AlterMap.vent.on("node:coords-picked", function(coords){
    AlterMap.saveNodeToCoords(AlterMap.currentNode, coords);
  });

  AlterMap.vent.on("node:destroyed", function(node_id){
    AlterMap.destroyNodeAndLinks(node_id);
  });
  
  /*
    AlterMap.vent.on("node:selected", function(node){
    AlterMap.showNode(node);
    router.navigate("nodes/" + node.id);
    });
  */

  AlterMap.networks.fetch({success: function(){
    AlterMap.nodes.fetch({success: function(){
        AlterMap.Map.zoomToNodes();
        if (AlterMap.networks.length==1){
          AlterMap.vent.trigger("network:selected", AlterMap.networks.at(0).id)
          AlterMap.globalToolboxRegion.close();
        }
    }});
  }});


});

AlterMap.on("initialize:after", function(){
//    Backbone.history.start();
});
