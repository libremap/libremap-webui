# LibreMap API documentation

## Router

### Read
Send a GET request to `/api/router/:id`:
```
curl -X GET http://libremap.net/api/router/d3e7183695687af88617e253d702ccf6
```

### Create
Assume that a valid router doc (see [below](#fields)) is stored in the file `router.json`. Then you send a POST request to `/api/router/`
```
curl -X POST -d @router.json http://libremap.net/api/router/
```
and you will receive an automatically generated ID
```
{"ok":true,"id":"d3e7183695687af88617e253d702ccf6"}
```
**Note:** The `_id`, `_rev`, `ctime` and `mtime` fields will be set automatically when creating a new router doc.

### Update
Assume that a valid router doc (see [below](#fields))is stored in the file `router.json`. Then you send a PUT request to `/api/router/:id`:
```
curl -X PUT -d @router.json http://libremap.net/api/router/d3e7183695687af88617e253d702ccf6
```
**Note 1:** The `mtime` field will be updated automatically.

**Note 2:** The `_rev` field in your provided data has to match the current `_rev` field on the server. This revision field is needed for replication.

### Delete
Send a DELETE request to `/api/router/:id`:
```
curl -X DELETE http://libremap.net/api/router/d3e7183695687af88617e253d702ccf6
```
**Note:** This currently requires admin privileges.

### Fields:
* `_id`: (required, string) a unique identifier; it's recommended to let CouchDB assign a uuid).
* `_rev`: (required, string) revision of the document (needed for CouchDB replication).
* `api_rev`: (required, string) currently `1.0`.
* `type`: (required, string) has to be `"router"` for routers.
* `hostname`: (required, string) displayed name of the router.
* `ctime`: (required, string) creation time in UTC of the form `"2013-05-11T13:05:22.000Z"` (is set automatically by update handler).
* `mtime`: (required, string) modification time, see `ctime`.
* `location`: (required, object)
  * `lat`: (required, number) latitude in degrees, range [-90,90], EPSG:3857.
  * `lon`: (required, number) longitude in degrees, range [-180,180], EPSG:3857.
  * `elev`: (optional, number) elevation in meters above mean sea level.
* `aliases`: (optional, array): each element is an object with the following keys:
  * `alias`: (required, string): alias name under which the router is known (for example in OLSR- or BATMAN-networks). Note that MAC-addresses or other information may be stored here. You may want to use a hash of MAC-addresses for privacy reasons. If you do that, just make sure that the same hash function is used for the `links`, see below.
  * `type`: (optional, string) this value may, for example, describe the routing protocol where the router is known under this alias, see the [example](#json-example) below.
* `links`: (optional, array) each element is an object with the following keys:
  * `alias`: (required, string) an alias name of the remote router.
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
  "hostname": "awesome-router",
  "ctime": "2013-05-11T13:05:22.000Z",
  "mtime": "2013-09-12T11:14:12.000Z",
  "location": {
    "lat": -31.805412,
    "lon": -64.424677,
    "elev": 50
  },
  "aliases": [
    {
      "alias": "104.201.0.29",
      "type": "olsr"
    },
    {
      "alias": "awesome-router.olsr",
      "type": "olsr"
    },
    {
      "alias": "21:13:f1:a5:a2:20",
      "type": "batman-adv"
    }
  ],
  "links": [
    {
      "alias": "104.201.0.64",
      "type": "olsr",
      "quality": 0.78,
      "attributes": {
        "etx": 2.094,
        "lq": 0.588,
        "nlq": 0.812
      }
    },
    {
      "alias": "52:23:61:a7:a1:56",
      "type": "batman-adv",
      "quality": 0.78
    }
  ],
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

### Views

Most views come in two flavors in order to let you control how much data is returned from the database. This is described here on the basis of the view `routers_by_location`.
* `routers_by_location` returns the full router documents.
* `routers_by_location_stripped` omits all `attributes` fields in the router document. Use the stripped view if you only need the [basic fields](#fields).

#### By Location
Send a GET request to `/api/routers_by_location/:bbox`
```
curl http://libremap.net/api/routers_by_location/13,52,14,53
```
The answer looks like this:
```
{
  "update_seq":581,
  "rows": [
    {
      "id": "d3e7183695687af88617e253d702ccf6",
      "bbox":[13.3849, 52.4930,13.3849, 52.4930],
      "geometry": {
        "type": "Point",
        "coordinates": [13.3849,52.4930]
      },
      "value": {
        "_id": "d3e7183695687af88617e253d702ccf6",
        ...
      }
    },
    ...
  ]
}
```
The documents' content can be found in the `value` field of each object in the `rows` array.

Additional options can be passed to the view with GET-style `?` and `&`:
* `count=true`: only returns the number of rows that would be returned. The returned JSON looks is of the form `{"count":4711}`.
* `limit`: limit number of rows that should be returned, e.g. `limit=10`.
* `skip`: return rows at the given offset, e.g. `skip=50`.
