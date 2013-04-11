AlterMap.Map = {
  _map: null,
  draw: function(coords){
    this._map = new OpenLayers.Map('map', {
      projection: new OpenLayers.Projection("EPSG:900913"),
      displayProjection: new OpenLayers.Projection("EPSG:4326"),
    });
    var center = new OpenLayers.LonLat(coords['lon'], coords['lat']);
    var zoom_level = 15;

    var map_layers = [ new OpenLayers.Layer.OSM("OpenStreetMap"),
                   new OpenLayers.Layer.Google(
                     "Google Hybrid",
                     {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
                   )
                 ]
    this._map.addLayers(map_layers);


    this.nodesLayer = new OpenLayers.Layer.Vector(
      "Nodes", {
        eventListeners: {
          'featureselected': function(evt){
            var marker = evt.feature;
            var node = marker.node;
            AlterMap.vent.trigger('node:selected', node.id);
          },
          'featureunselected': function(evt){
          },
          'scope': this,
        }
      })

    this._map.addLayer(this.nodesLayer);

    this.wifiLinksLayer = new OpenLayers.Layer.Vector(
      "WifiLinks",
      {
        styleMap: new OpenLayers.StyleMap({'default':{
          strokeColor: "#0F0",
          strokeOpacity: 0.5,
          strokeWidth: 5,
          fillColor: "#55ff00",
          fillOpacity: 0.5,
          pointRadius: 6,
          pointerEvents: "visiblePainted",
        }})
      });
    this._map.addLayer(this.wifiLinksLayer);

    this.selector = new OpenLayers.Control.SelectFeature(
      [this.nodesLayer, this.wifiLinksLayer],
      {geometryTypes: ['OpenLayers.Geometry.LineString',
                       'OpenLayers.Geometry.Point']},
      {clickout: true, toggle: true, multiple: false, hover: false}
    );
    this._map.addControl(this.selector);
    this.selector.activate();

    this._map.nodeDraw = new OpenLayers.Control.DrawFeature(
      this.nodesLayer, OpenLayers.Handler.Point)
    this._map.nodeDraw.featureAdded = this._positionNodeMarker
    this._map.addControl(this._map.nodeDraw);

    this._map.addControl(new OpenLayers.Control.MousePosition());
    this._map.addControl(new OpenLayers.Control.LayerSwitcher());

    this._map.setCenter(
      center.transform(
        this._map.displayProjection, this._map.projection
      ), zoom_level
    );
  },

  displayNodeMarker: function(node){
    var coords = node.get('coords');
    var point = new OpenLayers.Geometry.Point(coords.lon, coords.lat).transform(
      this._map.displayProjection, this._map.projection);
    var marker = new OpenLayers.Feature.Vector(point);
    marker.node = node;
    this.nodesLayer.addFeatures([marker]);
    return marker
  },
/*
  removeNodeMarker: function(node){
    this.nodesLayer.removeFeatures(node.marker, {silent: false});
  },
*/

  drawNodeMarker: function(){
    this._map.nodeDraw.activate();
  },

  _positionNodeMarker: function(feature){
    var map = feature.layer.map;
    var mouse_coords = feature.geometry.getBounds().getCenterLonLat()
    coords = mouse_coords.transform(map.projection,
                                    map.displayProjection);
    map.nodeDraw.deactivate();
    // a feature will be drawn when the node is saved
    feature.destroy();
    delete feature;
    AlterMap.vent.trigger('node:coords-picked', coords)
  },

  selectNodeMarker: function(node){
    if (this.nodesLayer.selectedFeatures.indexOf(node.marker)<0){
      this.selector.unselectAll();
      this.selector.select(node.marker);
    }
    var center = node.marker.geometry.getBounds().getCenterLonLat()
    this._map.setCenter(center, 18);
  },
  
  unselectNodeMarker: function(node){
      this.selector.unselect(node.marker);
  },
  resetMarkers: function(){
    this.nodesLayer.removeAllFeatures();
  },

  displayLinkLine: function(link){
    var source_point = new OpenLayers.Geometry.Point(
      link.source_coords.lon, link.source_coords.lat).transform(
        this._map.displayProjection, this._map.projection);
    var target_point = new OpenLayers.Geometry.Point(
      link.target_coords.lon, link.target_coords.lat).transform(
        this._map.displayProjection, this._map.projection);
    var linestring = new OpenLayers.Geometry.LineString([source_point, target_point]);
    var line = new OpenLayers.Feature.Vector(linestring);
//    line.link = link;
    this.wifiLinksLayer.addFeatures([line]);
    return line
  }, 

  resetLinkLines: function(){
    this.wifiLinksLayer.removeAllFeatures();
  },

  destroy: function(){
    this._map.destroy();
  },

  zoomToNodes: function(){
    if (this.nodesLayer.features.length >1){
      this._map.zoomToExtent(this.nodesLayer.getDataExtent());
    }
  }
}

