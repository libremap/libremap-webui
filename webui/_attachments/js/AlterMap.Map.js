AlterMap.Map = {
  _map: null,
  draw: function(){
    this._map = new OpenLayers.Map('map', {
      projection: new OpenLayers.Projection("EPSG:900913"),
      displayProjection: new OpenLayers.Projection("EPSG:4326"),
    });
    var map_layers = [ new OpenLayers.Layer.OSM("OpenStreetMap", null, {numZoomLevels: 23}),
                   new OpenLayers.Layer.Google(
                     "Google Hybrid",
                     {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
                   )
                 ]
    this._map.addLayers(map_layers);


    this.routersLayer = new OpenLayers.Layer.Vector(
      "Routers", {
        eventListeners: {
          'featureselected': function(evt){
            var marker = evt.feature;
            var router = marker.router;
            AlterMap.vent.trigger('router:selected', router.id);
          },
          'featureunselected': function(evt){
          },
          'scope': this,
        }
      })

    this._map.addLayer(this.routersLayer);

    this.wifiLinksLayer = new OpenLayers.Layer.Vector(
      "WifiLinks",
      {
        styleMap: new OpenLayers.StyleMap({'default':{
          strokeColor: "#0F0",
          fillColor: "#55ff00",
          pointRadius: 6,
          pointerEvents: "visiblePainted",
        }})
      });
    this._map.addLayer(this.wifiLinksLayer);

    this.selector = new OpenLayers.Control.SelectFeature(
      [this.routersLayer, this.wifiLinksLayer],
      {geometryTypes: ['OpenLayers.Geometry.LineString',
                       'OpenLayers.Geometry.Point']},
      {clickout: true, toggle: true, multiple: false, hover: false}
    );
    this._map.addControl(this.selector);
    this.selector.activate();

    this._map.routerDraw = new OpenLayers.Control.DrawFeature(
      this.routersLayer, OpenLayers.Handler.Point)
    this._map.routerDraw.featureAdded = this._positionRouterMarker
    this._map.addControl(this._map.routerDraw);

    this._map.addControl(new OpenLayers.Control.MousePosition());
    this._map.addControl(new OpenLayers.Control.LayerSwitcher());
  },

  createRouterMarker: function(router){
    var location = router.get('location');
    var point = new OpenLayers.Geometry.Point(location.lon, location.lat).transform(
      this._map.displayProjection, this._map.projection);
    var marker = new OpenLayers.Feature.Vector(point);
    marker.router = router;
    marker.attributes['name'] = router.get('name');
    marker.attributes['description'] = '';
    this.routersLayer.addFeatures([marker]);
    return marker
  },

  removeRouterMarker: function(router){
    this.routersLayer.removeFeatures(router.marker, {silent: false});
  },

  drawRouterMarker: function(){
    this._map.routerDraw.activate();
  },

  _positionRouterMarker: function(feature){
    var map = feature.layer.map;
    var mouse_location = feature.geometry.getBounds().getCenterLonLat()
    location = mouse_location.transform(map.projection,
                                    map.displayProjection);
    map.routerDraw.deactivate();
    // a feature will be drawn when the router is saved
    feature.destroy();
    delete feature;
    AlterMap.vent.trigger('router:location-picked', location)
  },

  selectRouterMarker: function(router){
    if (this.routersLayer.selectedFeatures.indexOf(router.marker)<0){
      this.selector.unselectAll();
      this.selector.select(router.marker);
    }
    var center = router.marker.geometry.getBounds().getCenterLonLat()
    this._map.setCenter(center);
  },
  
  unselectRouterMarker: function(router){
      this.selector.unselect(router.marker);
  },
  resetMarkers: function(){
    this.routersLayer.removeAllFeatures();
  },

  displayLinkLine: function(link){
    this.wifiLinksLayer.addFeatures([link.line]);
  },
  createLinkLine: function(link){
    var source_point = new OpenLayers.Geometry.Point(
      link.source_location.lon, link.source_location.lat).transform(
        this._map.displayProjection, this._map.projection);
    var target_point = new OpenLayers.Geometry.Point(
      link.target_location.lon, link.target_location.lat).transform(
        this._map.displayProjection, this._map.projection);
    var linestring = new OpenLayers.Geometry.LineString([source_point, target_point]);
    var line = new OpenLayers.Feature.Vector(linestring);
    var signal = parseFloat(link.attributes.signal);
    if (signal >= -65){
// over -65, we consider the link to already be good
      signal_factor = 1;
    }
// under -85 we will consider it a bad link
    else if (signal < -85){
      signal_factor = 0.2;
    }
    else{
      signal_factor = ((85 + signal) / (85 - 65) * (1 - 0.2) ) + 0.2;
    }
    line.style = {strokeColor: "#0F0", strokeWidth: 3, strokeOpacity: signal_factor/2};
//    line.attributes['name'] = link.attributes.local_mac +", "+ link.attributes.station_mac;
//    line.attributes['description'] = 'channel: '+ link.attributes.channel +', signal: '+ link.attributes.signal
    this.wifiLinksLayer.addFeatures([line]);
    line.link = link;
    return line
  }, 

  removeLinkLine: function(line){
// unselect in case the line was selected
    this.selector.unselectAll();
    line.destroy();
    this.wifiLinksLayer.removeFeatures(line, {silent: false});
//    delete line;
  },

  resetLinkLines: function(){
    this.wifiLinksLayer.removeAllFeatures();
  },

  destroy: function(){
    this._map.destroy();
  },

  zoomToRouters: function(){
    if (this.routersLayer.features.length>=1){
      this._map.zoomToExtent(this.routersLayer.getDataExtent());
    }
  },

  getKMLdata: function(){
    var kmlFormat = new OpenLayers.Format.KML({
      'maxDepth':10,
      'extractStyles':true,
      'internalProjection': this._map.projection,
      'externalProjection': new OpenLayers.Projection("EPSG:4326"),
      'foldersName': 'AlterMap KML export',
      'foldersDesc': '', 
    })
    return kmlFormat.write(this.routersLayer.features.concat(this.wifiLinksLayer.features))
  }
}

