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

    this.nodesLayer = new OpenLayers.Layer.Vector("Nodes");
    this._map.addLayer(this.nodesLayer);

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
  resetMarkers: function(){
    this.nodesLayer.removeAllFeatures();
  },
  destroy: function(){this._map.destroy()}
}

