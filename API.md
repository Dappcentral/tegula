# API

An exhaustive list of exposed methods and their functions. The following should be treated solely for advanced usage. As a general rule you _should_ be able to access everything necessary to work with the methods directly in the default exported class for this package (`Tegula`).

NOTE: The following examples assume you have setup tegula as demonstrated in the [README](README.md)

```js
const Tegula = require("tegula");
const tegula = new Tegula();

tegula.initialize().then(() => {
  // now you're good to go!
});
```

## Decentralizer

Exposed via `tegula._decentralizer`

#### Configuration Options

How to use:

```js
const tegula = new Tegula({
  decentralizer: {
    // decentralizer config
  },
});
```

Default and available options:

```js
{
  ipfsOptions: {
    // all configuration options for IPFS are available here:
    // https://github.com/ipfs/js-ipfs#ipfs-constructor
    EXPIREMENTAL: {
      // this is required for OrbitDB to work
      pubsub: true
    }
  },
  orbitDbOptions: {
    // only change this if you want to completely silo your data
    LOG_DATABASE: "tegula-logs"
  }
}
```

#### async initialize()

This method sets up the IPFS instance, the OrbitDB instance via IPFS, and specifically the event log instance via OrbitDB. Will set `tegula._decentralizer.isInitialized === true` on success as well as return `true` or an error based on whether everything worked.

```js
await tegula._decentralizer.initialize();
```

#### async disconnect()

Disconnects OrbitDB and stops IPFS. Only really necessary in environments where you need to re-initialize a new tegula instance with the same/default configuration options (e.g. when running tests). Returns `true`/`false` depending on its success.

```js
await tegula._decentralizer.disconnect();
```

#### async addData(data)

Accepts a single parameter, `data`, as a string and sends it off to IPFS to be stored. It then returns the IPFS hash or `false` if the input data is invalid.

```js
const ipfsHash = await tegula._decentralizer.addData(
  "stringified data to be stored",
);
```

#### async retrieveData(hash)

Returns the raw IPFS data stored at a given hash, or `false` if no hash is given.

```js
const data = await tegula._decentralizer.retrieveData("Qm...");
```

#### async addLog(data = {})

Appends JSON data to the OrbitDB event log. This method will also add a `_timestamp` key to the added data that is equivalent to `Date.now()`. Returns the IPFS hash of the new log, or `false` if no JSON is provided.

```js
const logHash = await tegula._decentralizer.addLog({ a: "b" });
```

#### async retrieveLogs(opts = {})

Returns all the OrbitDB event logs, sorted by `_timestamp`, and matching any provided `opts`. The available opts are defined [here](https://github.com/orbitdb/orbit-db/blob/master/API.md#iteratoroptions).

```js
const logs = await retrieveLogs();
```

---

## Encrypter

Exposed via `tegula._encrypter`

#### Configuration Options

How to use:

```js
const tegula = new Tegula({
  encrypter: {
    // encrypter config
  },
});
```

Default and available options:

```js
// none yet implemented
```

#### async initialize()

This is a placeholder method for now that returns `true` and sets `tegula._encrypter.isInitialized === true`.

```js
await tegula._encrypter.initialize();
```

#### async encrypt(ek, data)

Provided an encryption key (`ek`) and any `data` as parameters, this method will return the AES encrypted representation of that data. Will return `null` if bad parameters are given.

```js
const encrypted = await tegula._encrypter.encrypt("some key", "some data");
```

#### async decrypt(ek, encryptedData)

Provided an encryption key (`ek`) and any valid `encryptedData`, this method will return the original decrypted version of the data. Will return `null` with bad parameters and an empty string (`""`) if it fails to decrypt.

```js
const decrypted = await tegula._encrypter.decrypt(
  "some key",
  "some encrypted data",
);
```

#### async generate()

Return a new "encryption key" as a string based on 32 random hexadecimal values.

```js
const ek = await tegula._encrypter.generate();
```

---

## Identifier

Exposed via `tegula._identifier`

#### Configuration Options

How to use:

```js
const tegula = new Tegula({
  identifier: {
    // identifier config
  },
});
```

Default and available options:

```js
// none yet implemented
```

#### async initialize()

This is a placeholder method for now that returns `true` and sets `tegula._identifier.isInitialized === true`.

```js
await tegula._identifier.initialize();
```

#### async parseCoordinatesToUPI(lat, lng, unit = "")

Returns a UPI (Universal Property Identifier) as the sha3 hash of the concatenation of given latitude, longitude, and optional unit parameters. Latitude and longitude must be numerical values with at least 6 decimal places of precision, otherwise the method will return `null`.

```js
const upi = await tegula._identifier.parseCoordinatesToUPI(
  123.456789,
  -123.456789,
  "#17",
);
```

#### async normalizeAddress(address)

Normalizes a given address by converting to lowercase, replacing known terms with abbreviations, and stripping unnecessary special characters.

```js
// will return 123 apple st nyc ny
const normalizedAddress = await tegula._identifier.normalizeAddress(
  "123 Apple Street, NYC, NY",
);
```

#### async parseAddressToCoordinates(address)

Returns an object with keys including `latitude`, `longitude`, and `unitNumber` leveraging the Google Maps API. If no address is provided simply `{}` is returned.

NOTE: in order to use this method you must pass in a valid API key such as:

```js
const tegula = new Tegula({
  identifier: { googleMapsApiKey: "API-KEY-HERE" },
});
```

```js
const {
  latitude,
  longitude,
  unitNumber,
} = await tegula._identifier.parseAddressToCoordinates("123 apple street");
```

#### async parseAddressToUPI(address)

Combines `parseAddressToCoordinates` and `parseCoordinatesToUPI` from above. Returns `null` when no address is provided and otherwise returns a valid UPI.

```js
const upi = await parseAddressToUPI("123 apple street");
```

---

## ListingController

Exposed via `tegula._listingController`.

#### async initialize()

Returns a `Promise.all()` wrapper around initializing each of the three core classes; Decentralizer, Encrypter, and Identifier.

```js
await tegula._listingController.initialize();
```

#### async getListingFields()

A quick method to return an array of the valid listing field keys. Used in ListingController#normalizeData below.

```js
const validKeys = await tegula._listingController.getListingFields();
```

#### async normalizeData(data)

Returns a "normalized" form of given listing data. This will include things like camelCasing keys and cleaning up price formats.

```js
const listingData = { address: "123 apple street" };
const normalized = await tegula._listingController.normalizeData(listingData);
```

#### async validateUserAddress(userAddress)

Returns a truthy value based on whether or not the given `userAddress` parameter is a valid Ethereum address.

```js
const isValid = await tegula._listingController.validateUserAddress(
  "some address",
);
```

#### async parseUPI(data)

Method to parse the UPI from a given set of data. First looks at `latitude` and `longitude` values, otherwise tries looking them up based on the address provided (only available if Google Maps is also initialized via the configuration option above).

```js
const UPI = await tegula._listingController.parseUPI({
  latitude: 123.456789,
  longitude: 123.456789,
});
```

#### async addData(data, userAddress, ek)

Accepts data, a user address, and an encryption key as required parameters and throws an error if any are missing. The method first normalizes the data, computes the UPI, encrypts it, sends it to IPFS, and finally adds it as a log event via OrbitDB. Will throw appropriate errors if any of those steps fail, otherwise will return `true`.

```js
const listingData = { address: "123 apple street" };
await protocl._listingController.addData(
  listingData,
  "some address",
  "some key",
);
```

#### async getLogsByAddress(userAddress)

Returns all the OrbitDB event logs matching the given `userAddress` parameter. If the given `userAddress` is not a valid address then the method immediately returns `[]`.

```js
const logs = await tegula._listingController.getLogsByAddress(
  "some user address",
);
```

---

## Tegula

Exposed directly via `tegula`.

#### async initialize()

Calls the `initialize()` methods for each of it's `this._decentralizer`, `this._encrypter`, `this._identifer`, and `this._listingController` sub-classes.

```js
await tegula.initialize();
```

#### async disconnect()

A root-level shortcut to `tegula._decentralizer.disconnect()`.

```js
await tegula.disconnect();
```

#### async setUserAddress(userAddress)

Sets tegula's current `_userAddress` value allowing other methods to be used without explicitly passing one in.

```js
await tegula.setUserAddress("some user address");
```

#### async setEncryptionKey(ek)

Sets tegula's current `_encryptionKey` value allowing other methods to be used without explicitly passing one in.

```js
await tegula.setEncryptionKey("some key");
```

#### async parseUPI(data)

Method to parse the UPI from a given set of data. First looks at `latitude` and `longitude` values, otherwise tries looking them up based on the address provided (only available if Google Maps is also initialized via the configuration option above). This directly calls the ListingController#parseUPI method listed above.

```js
const UPI = await tegula.parseUPI({
  latitude: 123.456789,
  longitude: 123.456789,
});
```

#### async addListing(data, userAddress, ek)

A root-level abstraction around `tegula._listingController.addData`. Returns `true` upon success, otherwise returns the corresponding error. Accepts optional user address and encryption key parameters, otherwise defaults to previously set values.

```js
const listingData = { address: "123 apple street" };
await tegula.addListing(listingData);
```

#### async getLogsByAddress(userAddress)

Accepts an optional `userAddress` parameter. Returns the logs for a user address directly from `tegula._listingController.getLogsByAddress`.

```js
const logs = await tegula.getLogsByAddress("some user address");
```

#### async batchAddListings(listings = [])

A `Promise.all` wrapper around a list of listing data, mapped to `tegula.addListing`;

```js
const listings = [{ address: "some address 1" }, { address: "some address 2" }];
await tegula.batchAddListings(listings);
```

#### async getListings(ek, userAddress)

Returns listings provided an optional encryption key (`ek`) and optional `userAddress`. It first looks up all the logs, pulls out the most recent IPFS hashes per UPI, grabs the related content from IPFS, and then decrypts it all.

```js
const listings = await tegula.getListings();
```
