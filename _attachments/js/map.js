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


/* LeafLet Map implementation */

// Marker Draw code based on https://github.com/jacobtoye/Leaflet.draw/blob/master/dist/leaflet.draw-src.js

L.Handler.Draw = L.Handler.extend({
    includes: L.Mixin.Events,

    initialize: function (map) {
        this._map = map;
    },

    addHooks: function () {
        if (this._map) {
            L.DomUtil.disableTextSelection();
            L.DomEvent.addListener(window, 'keyup', this._cancelDrawing, this);
        }
    },
    removeHooks: function () {
        if (this._map) {
            L.DomUtil.enableTextSelection();
            L.DomEvent.removeListener(window, 'keyup', this._cancelDrawing);
        }
    },
    _cancelDrawing: function (e) {
        if (e.keyCode === 27) {
            this.disable();
            delete(this);
        }
    }
});

L.Marker.Draw = L.Handler.Draw.extend({
    options: {
        icon: new L.Icon.Default(),
        zIndexOffset: 2000 // This should be > than the highest z-index any markers
    },
    initialize: function (map, node) {
        L.Handler.Draw.prototype.initialize.call(this, map);
        this._map = map;
        this.node = node;
    },

    addHooks: function () {
        L.Handler.Draw.prototype.addHooks.call(this);

        if (this._map) {
            this._map.on('mousemove', this._onMouseMove, this);
        }
    },

    removeHooks: function () {
        L.Handler.Draw.prototype.removeHooks.call(this);

        if (this._map) {
            if (this._marker) {
                this._marker.off('click', this._onClick);
                this._map
                    .off('click', this._onClick)
                    .removeLayer(this._marker);
                delete this._marker;
            }

            this._map.off('mousemove', this._onMouseMove);
        }
    },

    _onMouseMove: function (e) {
        var newPos = e.layerPoint,
        latlng = e.latlng;

        if (!this._marker) {
            this._marker = new L.Marker(latlng, {
                icon: this.options.icon,
                zIndexOffset: this.options.zIndexOffset,
                opacity: 0.5,
            });
            // Bind to both marker and map to make sure we get the click event.
            this._marker.on('click', this._onClick, this);
            this._map
                .on('click', this._onClick, this)
                .addLayer(this._marker);
        }
        else {
            this._marker.setLatLng(latlng);
        }
    },

    _onClick: function (e) {
        coords = {lat: this._marker.getLatLng().lat, lon: this._marker.getLatLng().lng}
        this.node.saveToCoords(coords)
        this.disable();
        delete(this);
    }
});


var LeafletMap = Map.extend({
    drawMap: function draw_map(coords){
        this._map = L.map(this._el).setView([coords.lat, coords.lon], 15);
        defaultLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                           attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a></a>',
                           maxZoom: 18
                       }).addTo(this._map);

        var layers = { 'OpenStreetMap': defaultLayer,
                       'Google Satelite':
                       L.tileLayer('http://mt1.google.com/vt/lyrs=s@121&hl=en&x={x}&y={y}&z={z}', {
                           attribution: 'Map data © 2012 Google',
                           maxZoom: 18
                       })
                     }

	this._map.addControl(new L.Control.Layers(layers,'',{collapsed: true}));
    },

    _latlng: function (node){
        return [node.get('coords').lat, node.get('coords').lon]
    },

    displayNodeMarker: function(node){
        template = _.template($("#node-summary-template").html()),
        summary = template(node.toJSON())
        coords = this._latlng(node)
        marker = L.marker(coords, {title: node.get('name')}).addTo(this._map);
        var popup = L.popup().setLatLng(coords).setContent(summary)
        marker._popup = popup;
        marker.on('click', marker.openPopup, marker);
//        marker.on('click', node.setCurrent);
        return marker;
    },

    positionNodeMarker: function(node){
        var marker_handler = new L.Marker.Draw(this._map, node);
        marker_handler.enable();
    },

    moveNodeMarker: function(node){
    },

    selectNodeMarker: function(node){
        node.marker.openPopup();
    },

    drawLink: function(source_coords, dest_coords){
    }
});
