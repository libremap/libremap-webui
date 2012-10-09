var map = new LeafletMap('map');
map.drawMap({lat: -31.802967214779812, lon: -64.41782692156015});

$(function() {
    var app_router = new NodesAppRouter()
    Backbone.history.start();
})
