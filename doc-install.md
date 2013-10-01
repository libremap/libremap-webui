# LibreMap installation guide

## Prerequisites
* [CouchDB](https://couchdb.apache.org/) 1.3 or newer.
* [GeoCouch](https://github.com/couchbase/geocouch/) plugin. You can build CouchDB with GeoCouch with the [build-couchdb](https://github.com/iriscouch/build-couchdb) tool.
* [erica](https://github.com/benoitc/erica).

## Installation
* Install the [prerequisites](#prerequisites).
* Create a new database in your CouchDB instance. We assume that your databaseis located at `http://HOST/DB` and that you have an admin user with username/password `USER`/`PASS`.
* Clone the libremap repository, e.g. `git clone git@github.com:libre-mesh/libremap.git`.
* Upload the API and webui design documents by issuing:
  ```
cd api
erica push http://USER:PASS@HOST/DB
cd ../webui
erica push http://USER:PASS@HOST/DB
```
The webui should now be running at `http://HOST/DB/_design/libremap-webui/_rewrite`.
* Configure a vhost. If you have a domain at hand, let's say `DOMAIN`, then let it point to your CouchDB server and add the following section to your CouchDB configuration (`http://HOST/_utils/config.html`):
  * section: `vhosts`
  * option: `DOMAIN`.
  * value: `/DB/_design/libremap-webui/_rewrite`.
  Enjoy libremap at `http://DOMAIN/`!
