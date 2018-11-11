# API

An exhaustive list of exposed methods and their functions. The following should be treated solely for advanced usage. As a general rule you _should_ be able to access everything necessary to work with the methods directly in the default exported class for this package (`Protocol`).

NOTE: The following examples assume you have setup the protocol as demonstrated in the [README](README.md)

```js
const Protocol = require("imbrexer");
const protocol = new Protocol();

protocol.initialize().then(() => {
  // now you're good to go!
});
```

## Decentralizer

Exposed via `protocol._decentralizer`

#### Configuration Options

How to use:

```js
const protocol = new Protocol({
  decentralizer: {
    // decentralizer config
  },
});
```

Default and available options:

```js
{
  ipfsOptions: {
    // all configuration options for IPFS are available here
    // TODO: link
    EXPIREMENTAL: {
      // this is required for OrbitDB to work
      pubsub: true
    }
  },
  orbitDbOptions: {
    // only change this if you want to completely silo your data
    LOG_DATABASE: "imbrexer-logs"
  }
}
```

#### async initialize()

This method sets up the IPFS instance, the OrbitDB instance via IPFS, and specifically the event log instance via OrbitDB. Will set `protocol._decentralizer.isInitialized === true` on success as well as return `true` or an error based on whether everything worked.

```js
await protocol._decentralizer.initialize();
```

#### async disconnect()

Disconnects OrbitDB and stops IPFS. Only really necessary in environments where you need to re-initialize a new protocol instance with the same/default configuration options (e.g. when running tests). Returns `true`/`false` depending on its success.

```js
await protocol._decentralizer.disconnect();
```

#### async addData(data)

Accepts a single parameter, `data`, as a string and sends it off to IPFS to be stored. It then returns the IPFS hash or `false` if the input data is invalid.

```js
const ipfsHash = await protocol._decentralizer.addData(
  "stringified data to be stored",
);
```

#### async retrieveData(hash)

Returns the raw IPFS data stored at a given hash, or `false` if no hash is given.

```js
const data = await protocol._decentralizer.retrieveData("Qm...");
```

#### async addLog(data = {})

Appends JSON data to the OrbitDB event log. This method will also add a `_timestamp` key to the added data that is equivalent to `Date.now()`. Returns the IPFS hash of the new log, or `false` if no JSON is provided.

```js
const logHash = await protocol._decentralizer.addLog({ a: "b" });
```

#### async retrieveLogs(opts = {})

Returns all the OrbitDB event logs, sorted by `_timestamp`, and matching any provided `opts`. The available opts are defined [here](TODO).

```js
const logs = await retrieveLogs();
```

---

## Encrypter

Exposed via `protocol._encrypter`

#### Configuration Options

How to use:

```js
const protocol = new Protocol({
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

This is a placeholder method for now that returns `true` and sets `protocol._encrypter.isInitialized === true`.

```js
await protocol._encrypter.initialize();
```

#### async encrypt(ek, data)

Provided an encryption key (`ek`) and any `data` as parameters, this method will return the AES encrypted representation of that data. Will return `null` if bad parameters are given.

```js
const encrypted = await protocol._encrypter.encrypt("some key", "some data");
```

#### async decrypt(ek, encryptedData)

Provided an encryption key (`ek`) and any valid `encryptedData`, this method will return the original decrypted version of the data. Will return `null` with bad parameters and an empty string (`""`) if it fails to decrypt.

```js
const decrypted = await protocol._encrypter.decrypt(
  "some key",
  "some encrypted data",
);
```

#### async generate()

Return a new "encryption key" as a string based on 32 random hexadecimal values.

```js
const ek = await protocol._encrypter.generate();
```

---

## Identifier

Exposed via `protocol._identifier`

#### Configuration Options

How to use:

```js
const protocol = new Protocol({
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

This is a placeholder method for now that returns `true` and sets `protocol._identifier.isInitialized === true`.

```js
await protocol._identifier.initialize();
```

#### async parseCoordinatesToUPI(lat, lng, unitId = "")

Returns a UPI (Universal Property Identifier) as the sha3 hash of the concatenation of given latitude, longitude, and optional unit ID parameters. Latitude and longitude must be numerical values with at least 6 decimal places of precision, otherwise the method will return `null`.

```js
const upi = await protocol._identifier.parseCoordinatesToUPI(
  123.456789,
  -123.456789,
  "#17",
);
```

#### async normalizeAddress(address)

Normalizes a given address by converting to lowercase, replacing known terms with abbreviations, and stripping unnecessary special characters.

```js
// will return 123 apple st nyc ny
const normalizedAddress = await protocol._identifier.normalizeAddress(
  "123 Apple Street, NYC, NY",
);
```

#### async parseAddressToCoordinates(address)

Returns an object with keys including `lat`, `lng`, and `unitId`. If no address is provided simply `{}` is returned.

```js
const {
  lat,
  lng,
  unitId,
} = await protocol._identifier.parseAddressToCoordinates("123 apple street");
```

#### async parseAddressToUPI(address)

Combines `parseAddressToCoordinates` and `parseCoordinatesToUPI` from above. Returns `null` when no address is provided and otherwise returns a valid UPI.

```js
const upi = await parseAddressToUPI("123 apple street");
```
