//var map = new LeafletMap('map');
var map = new OLMap('map');
NETWORK_COORDS = {lat: -31.802967214779812, lon: -64.41782692156015}
map.drawMap(NETWORK_COORDS);

$(function() {
    var app_router = new NodesAppRouter()
    Backbone.history.start();
})
