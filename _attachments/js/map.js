var Map = Toolbox.Base.extend({
    constructor: function (element_id) {
        this._el = element_id;
    },
    drawMap: function(coords){
// must display a map modifying the content of <this._el>
// the map will be centered to <coords>
    },

    displayNodeMarker: function(coords, summary){
// must create a marker at the given <coords> with <summary> data attached
// must return the new marker object so it can be bound to the corresponding Node object
    },

    moveNodeMarker: function(marker){
// must return the modified marker object
    },

    drawLink: function(source_coords, dest_coords){
// must display a line from <source_coords> to <dest_coords>
    }
});


var OLMap = Map.extend({
    constructor: function (element_id) {
//        this._el = element_id;
        options = {
                projection: new OpenLayers.Projection("EPSG:900913"),
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
            }; 
        this._map = new OpenLayers.Map(element_id, options);
    },
    drawMap: function draw_map(coords){
        center = new OpenLayers.LonLat(coords['lon'], coords['lat']);
        zoom_level = 15;

        map_layers = [ new OpenLayers.Layer.OSM("OpenStreetMap"),
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
                        marker = evt.feature;
                        var node = marker.node;
                        template = _.template($("#node-summary-template").html()),
                        summary = template(node.toJSON());
                        CURRENT_NODE = node;
                        var popup = new OpenLayers.Popup.FramedCloud(
                            "chicken", 
                            marker.geometry.getBounds().getCenterLonLat(),
                            new OpenLayers.Size(200,100),
                            summary, null, true, null// this._onPopupClose
                        );
                        marker.popup = popup;
                        this._map.addPopup(popup);

                    },
                    'featureunselected': function(evt){
                        marker = evt.feature;
                        this._map.removePopup(marker.popup);
                        marker.popup.destroy();
                        delete marker.popup;
                    },
                    'scope': this,
                }
            })

        this._map.addLayer(this.nodesLayer);

        this.wifiLinksLayer = new OpenLayers.Layer.Vector(
            "WifiLinks", {
                styleMap: new OpenLayers.StyleMap({'default':{
                    strokeColor: "#0F0",
                    strokeOpacity: 0.5,
                    strokeWidth: 5,
                    fillColor: "#55ff00",
                    fillOpacity: 0.5,
                    pointRadius: 6,
                    pointerEvents: "visiblePainted",
                }}),
                renderers: OpenLayers.Layer.Vector.prototype.renderers,
                eventListeners: {
                    'featureselected': function(evt){
                        line = evt.feature;
                        var link = line.link;
                        template = _.template($("#wifilink-summary-template").html()),
                        summary = template(link.toJSON());
                        //        CURRENT_LINK = link
                        var popup = new OpenLayers.Popup.FramedCloud(
                            "chicken", 
                            line.geometry.getBounds().getCenterLonLat(),
                            new OpenLayers.Size(200,100),
                            summary, null, true, null// this._onPopupClose
                        );
                        line.popup = popup;
                        this._map.addPopup(popup);

                    },
                    'featureunselected': function(evt){
                        line = evt.feature;
                        this._map.removePopup(line.popup);
                        line.popup.destroy();
                        delete line.popup;
                    },
                    'scope': this,
                }
            })

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
            this.nodesLayer,
            OpenLayers.Handler.Point)
        this._map.nodeDraw.featureAdded = this.positionNodeMarker
        this._map.addControl(this._map.nodeDraw);

        this._map.addControl(new OpenLayers.Control.LayerSwitcher());

        this._map.setCenter(
            center.transform(
                this._map.displayProjection, this._map.projection
            ), zoom_level
        );
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
        line.link = link;
        this.wifiLinksLayer.addFeatures([line]);
        return line
    },

    displayNodeMarker: function(node){
        var coords = node.get('coords');
//        if (coords == undefined) coords = NETWORK_COORDS;
        var point = new OpenLayers.Geometry.Point(coords.lon, coords.lat).transform(
            this._map.displayProjection, this._map.projection);
        var marker = new OpenLayers.Feature.Vector(point);
        marker.node = node;
        this.nodesLayer.addFeatures([marker]);
        return marker
    },

    drawNodeMarker: function(node){
        this._map.nodeDraw.activate();
    },

    positionNodeMarker: function(feature){
        var map = feature.layer.map;
        var mouse_coords = feature.geometry.getBounds().getCenterLonLat()
        coords = mouse_coords.transform(map.projection,
                                         map.displayProjection);
        if (CURRENT_NODE != null){
            var floating_node = CURRENT_NODE;
            floating_node.set({coords: coords});
            
            floating_node.save();
            floating_node.marker = feature;
            feature.destroy();
            delete feature
            CURRENT_NODE = null;
        }
        map.nodeDraw.deactivate();
    },
 
    moveNodeMarker: function(node){
    },

    selectNodeMarker: function(marker){
        this.selector.unselectAll();
        this.selector.select(marker)
    },

    removeNodeMarker: function(marker){
        this.nodesLayer.removeFeatures(marker, {silent: false});
    },

    drawLink: function(source_coords, dest_coords){
    }
});

