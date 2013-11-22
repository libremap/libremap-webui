# LibreMap

LibreMap is a **scalable**, **global** and **decentralized** router database and map visualization for community networks, such as guifi, Altermundi, FunkFeuer, ninux, freifunk, Commotion... It emerged around the [is4cwn](http://2013.wirelesssummit.org/) by merging the maps of [AlterMap](https://colectivo.altermundi.net/projects/altermap) (Altermundi) and [OpenWiFiMap](https://github.com/freifunk/openwifimap-html5) (freifunk).

LibreMap consists of 2 main parts:
* **libremap-webui (this repo!):** the HTML5 web app.
* **[libremap-api](https://github.com/libremap/libremap-api):** the CouchDB server design document that exposes the *LibreMap API*.

## Goals of LibreMap:
* show the state of all community networks, both on a global and local scale.
* decentralized.
* easy to use and extend.
* independent of involved routing protocols and other technical details.
* scale up to global level (>100k routers).
* share open data for community networks.

There's a presentation ([slides](http://libre-mesh.github.io/libremap-talk-2013-is4cwn/)) from the [is4cwn](http://2013.wirelesssummit.org/) that explains the concept and some details.

## Set up your own LibreMap website
### Requirements
You need the following:
* [node.js](http://nodejs.org/) (>= 0.8.0) and its great package manager `npm`.
* [Grunt](http://gruntjs.com/) - can be installed by running: ```npm install -g grunt-cli```
* [Bower](http://bower.io/) - can be installed by running ```npm install -g bower```

### Installation
1. Clone the repo: ```git clone git@github.com:libremap/libremap-webui.git``` and change to the repo dir: ```cd libremap-webui```.
2. Download dependencies: ```npm install``` and ```bower install```.
3. Copy `config.json.example` to `config.json` and configure your LibreMap API URL there. If you don't have your own [LibreMap API](https://github.com/libremap/libremap-api) you can use an existing one, for example ```http://libremap.net/api```.
4. Run ```grunt``` and open ```http://127.0.0.1:9000``` in your browser.
5. Deployment: you have 2 options:
    1. Make the files under ```build``` available with an HTTP server of your choice.
    2. Use a CouchDB server (recommended if you also run your own [LibreMap API](https://github.com/libremap/libremap-api)):
        1. Copy `couch.json.example` to `couch.json` and configure your CouchDB server there.
        2. Push the webui design document to your CouchDB server (for example the `dev` target in `couch.json`) by running ```grunt push --couch dev```.

## Bugs and feature requests
Please use the issues tracker if you found a bug or have an idea how to improve LibreMap!

## Contact
LibreMap is maintained by [André](https://github.com/andrenarchy) and [Nico](https://github.com/nicoechaniz). There is a **[mailing list](http://lists.libremap.net/mailman/listinfo/discussion)** for questions and discussions about LibreMap, so feel free to drop a line there!

## License

LibreMap is licensed under [GPL3](LICENSE).
