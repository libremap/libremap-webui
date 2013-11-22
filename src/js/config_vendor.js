// include the shimmed modules first
// (they make trouble otherwise)

var Backbone = require('backbone');
// set Backbone's jquery property
Backbone.$ = require('jquery');

var bootstrap = require('bootstrap');
var L = require('leaflet');
// Leaflet has to know where the images reside
L.Icon.Default.imagePath = 'images/vendor/leaflet';
