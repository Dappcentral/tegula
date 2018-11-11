# The Imbrexer Protocol

The Imbrexer Protocol is a low level abstraction layer for securely decentralizing the world's listing data. The core of the package is three main classes:

1. `Decentralizer`: the raw connection layer enabling adding and retrieving data directly to IPFS as well as in a structured event log via OrbitDB on IPFS
2. `Encrypter`: the encryption layer that securely encrypts/decrypts JSON data with a given key
3. `Identifier`: the identification layer for uniquely, and consistently, generating UPIs (Universal Property Identifiers) for listings based on their geo-coordinates

These three classes come together in the `ListingController` and then abstracted one step further in the `Protocol` class (which is what gets exposed by default). At the `Protocol` level the three agnostic classes listed above are wrapped in listing-specific logic that enables the easy addition and retrieval of listings given a user address and an encryption key.

---

## Installation

This package can be install via [npm](https://www.npmjs.com/package/imbrexer)

```bash
npm install --save imbrexer
```

---

## Basic Usage

#### Initialize

```js
// import the package
const Protocol = require("imbrexer");
// setup a new class instance
const protocol = new Protocol();

// initialize everything
protocol.initialize().then(() => {
  // now you're good to go!
});

// OR if you're inside an async method already
await protocol.initialize();
```

#### Set Address and Encryption Keys

```js
// ...

protocol.initialize().then(async () => {
  await protocol.setUserAddress("0xAbC...");
  await protocol.setEncryptionKey("some-encryption-key");
});
```

#### Add a Listing

```js
// ...

protocol.initialize().then(async () => {
  // ...

  const listingData = { lat: 123.456789, lng: 123.456789, ... };
  await protocol.addListing(listingData);
});
```

#### Fetch Listings for a given Address

```js
// ...
protocol.initialize().then(async () => {
  // ...

  // Option 1: use previously set encryption key and user address values
  const listings = await protocol.getListings();
  // Option 2: pass in one-time use
  const listings = await protocol.getListings("some-encryption-key", "0xAbC");
});
```

For a more complete list of available methods, visit [API.md](API.md)

---

## Dependencies

- [Crypto-JS]() - node `crypto` library universally available and used here for encryption
- [IPFS](https://ipfs.io) - decentralized file storage
- [OrbitDB]() - database methods atop IPFS
- [Web3]() - Ethereum wrapper used here for address validation and sha3 hashing

## DevDependencies

- [Babel]() - ES2015 transpiling
- [Eslint]() - linting
- [Gulp]() - build tools for packaging
- [Mocha]() - unit testing
- [Prettier]() - opinionated code formatting

---

## Project Structure

This project is split into a few main directories:

1. `dist/` - this is where the actual built and minified files live
2. `examples/` - some quick example files for using the various classes
3. `src/` - the raw source code
4. `test/` - unit tests for everything in `src`

```
├── .cicleci/
├──── config.yml
├── dist/
├── examples/
├──── decentralizer.example.js
├──── encrypter.example.js
├──── identifier.example.js
├──── protocol.example.js
├── node_modules/
├── src/
├──── decentralizer.js
├──── encrypter.js
├──── identifier.js
├──── index.js
├──── listing-controller.js
├──── protocol.js
├── test/
├──── _setup.js
├──── decentralizer.test.js
├──── encrypter.test.js
├──── identifier.test.js
├──── listing-controller.test.js
├──── protocol.test.js
├── .eslintignore
├── .eslintrc.json
├── .npmignore
├── .prettierrc
├── API.md
├── guplfile.js
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
```

---

## Tests

Every logic file in the `src/` directory has a corresponding test in the `test/` directory. Each method is unit tested which consequently results in cross-class integration tests with the `Protocol` and `ListingController` class tests.

```bash
npm test
```
