# LibreMap API documentation

This document describes the current **API revision 1.0** and contains documentation for:
* [Router](#routers)
* [History](#history) (todo!)

## Routers

### Fields:
* `_id`: (required, string) a unique identifier; it's recommended to let CouchDB assign a uuid).
* `_rev`: (required, string) revision of the document (needed for CouchDB replication).
* `api_rev`: (required, string) currently `1.0`.
* `type`: (required, string) has to be `"router"` for routers.
* `name`: (required, string) displayed name of the router.
* `ctime`: (required, string) creation time in UTC of the form `"2013-05-11T13:05:22.000Z"` (is set automatically by update handler).
* `mtime`: (required, string) modification time, see `ctime`.
* `location`: (required, object)
  * `lat`: (required, number) latitude in degrees, range [-180,180], EPSG:3857.
  * `lon`: (required, number) longitude in degrees, range [-90,90], EPSG:3857.
  * `elev`: (optional, number) elevation in meters above mean sea level.
* `aliases`: (optional, object): 
  * keys: aliases under which the router is known (for example in OLSR- or BATMAN-networks). Note that MAC-addresses or other information may be stored here. You may want to use a hash of MAC-addresses for privacy reasons. If you do that, just make sure that the same hash function is used for the `links`, see below.
  * values: the value is an object with currently only one optional key `type`. Its value may, for example, describe the routing protocol where the router is known under this alias, see the [example](#json-example) below. 
* `links`: (optional, object)
  * keys: an alias name of the remote router.
  * values: (required, object):
    * `type`: (optional, string) the alias type of the remote router, see `aliases` above.
    * `quality`: (optional, number) quality of the link, in range [0, 1] where 0 is the poorest and 1 is the best link quality.
    * `attributes`: (optional, object) you may store arbitrary information for a link here, e.g. link information that depends on the routing protocol (like LQ, NLQ and ETX values in OLSR).
* `site`: (optional, string) a site this router belongs to, e.g. `"roof town hall"`.
* `community`: (optional, string) a community this router belongs to, e.g. `"Freifunk/Berlin"`.
* `attributes`: (optional, object) you may store arbitrary information for the router here.

### JSON Example
```javascript
{
  "_id": "3f667d6dfb498947e4c365d74900529f",
  "_rev": "3-37410011998c58fefb630bcb7d566f9e",
  "api_rev": "1.0",
  "type": "router",
  "name": "awesome-router",
  "ctime": "2013-05-11T13:05:22.000Z",
  "mtime": "2013-09-12T11:14:12.000Z",
  "location": {
    "lon": -64.424677,
    "lat": -31.805412,
    "elev": 50
  },
  "aliases": {
    "104.201.0.29": {
      "type": "olsr"
    },
    "awesome-router.olsr": {
      "type": "olsr"
    },
    "21:13:f1:a5:a2:20": {
      "type": "batman-adv"
    }
  },
  "links": {
    "104.201.0.64": {
      "type": "olsr",
      "quality": 0.78,
      "attributes": {
        "etx": 2.094,
        "lq": 0.588,
        "nlq": 0.812
      }
    },
    "52:23:61:a7:a1:56": {
      "type": "batman-adv",
      "quality": 0.78
    }
  },
  "site": "roof town hall",
  "community": "Freifunk/Berlin",
  "attributes": {
    "firmware": {
      "name": "meshkit",
      "rev": "47d69e2001a789a104117af266332c73919b4326",
      "url": "http://meshkit.freifunk.net/"
    }
  }
}
```
