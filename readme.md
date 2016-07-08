# Ultrafast BSON typescript parser

This module is an ultrafast serializer and deserializer for the [BSON](http://bsonspec.org) format.  
It is written in clean typescript and has no other lib dependencies.
BSON is mainly used as compact transport format for (JSON) objects.


### Motivation
I needed a simple, fast and clean (typescript) module to generate and parse BSON for storing JSON objects in files efficiently.  
There are some parsers around (2016/06), mainly the primary one of the mongodb project. But I found that it's really not lightweight enough and too slow for mobile usage.  
A further requirement was using typed arrays instead of nodejs buffers, to get this baby portable and running in browsers, too.


### Design goals:
- Written in typescript
- Fast and lightweight parser
- Very easy to use, just one include module, NO dependencies
- tslint warning free, clean code
- Unit tested
- Rocksolid (I hope so)
- MIT license


## Usage
Using this module is rather simple. Copy */src/bson.ts* to your project and import it:

```typescript
import { BSON } from './bson';

// create a test document
let doc = { id: 10, time: new BSON.UTC(), arr: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]) };

// serialize the document
let bson = BSON.serialize(doc);

// and deserialize it, using BSON.UTC objects as time representation
let orig = BSON.deserialize(bson, true);
```


Run the mocha tests with
```
npm run test
```


## API

Basically the API consists of just two static methods to serialize/deserialize objects to/from BSON format:

### BSON serialization and deserialiation

**`BSON.serialize(object)`**
  * @param {Object} object The Javascript object to serialize
  * @return {Uint8Array} returns an Uint8Array in BSON format.  
    Unknown objects are ignored in serialization.

**`BSON.deserialize(buffer, useUTC)`**
  * @param {Uint8Array} buffer An Uint8Array containing the BSON data
  * @param {Boolean} useUTC Optional, if set a `BSON.UTC` object is created for 'UTC datetime' instead of a normal JS `Date` object. Defaults to false
  * @return {Object} returns the deserialized Javascript object or `undefined` in case of a parsing error (unsupported BSON element etc.)


### UTC

**`bson.ObjectId.isValid(id)`** - Returns true if `id` is a valid number or hexadecimal string representing an ObjectId.
**`bson.ObjectId.createFromHexString(hexString)`** - Returns the ObjectId the `hexString` represents.
**`bson.ObjectId.createFromTime(time)`** - Returns an ObjectId containing the passed time.
* `time` - A Unix timestamp (number of seconds since the epoch).


### UUID

**`bson.ObjectId.isValid(id)`** - Returns true if `id` is a valid number or hexadecimal string representing an ObjectId.
**`bson.ObjectId.createFromHexString(hexString)`** - Returns the ObjectId the `hexString` represents.
**`bson.ObjectId.createFromTime(time)`** - Returns an ObjectId containing the passed time.
* `time` - A Unix timestamp (number of seconds since the epoch).


### ObjectId

**`bson.ObjectId.isValid(id)`** - Returns true if `id` is a valid number or hexadecimal string representing an ObjectId.
**`bson.ObjectId.createFromHexString(hexString)`** - Returns the ObjectId the `hexString` represents.
**`bson.ObjectId.createFromTime(time)`** - Returns an ObjectId containing the passed time.
* `time` - A Unix timestamp (number of seconds since the epoch).


### Unsupported elements
The following BSON elements are currently not supported (and lead to a deserialiation error):
- JavaScript code
- Min key
- Max key
- Regular expression (implemented, but untested yet - so don't rely on it)


## Caveats
- 64-bit integer BSON values are converted to the Javascript Number type.  
  However, Javascript supports  integer precision up to 2^53 as maximum size.
  If a parsed 64-bit integer exceeds this size, floating point rounding errors may occur!


## Bottom line
Have fun and report any errors or improvment suggestions please.


## License
This BSON module is written under the **MIT** license
