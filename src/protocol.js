const Decentralizer = require("./decentralizer");
const Encrypter = require("./encrypter");
const Identifier = require("./identifier");
const ListingController = require("./listing-controller");

module.exports = class Protocol {
  constructor(config) {
    this.config = config || {};

    // configure instantiated methods
    this._decentralizer = new Decentralizer(this.config.decentralizer);
    this._encrypter = new Encrypter(this.config.encrypter);
    this._identifer = new Identifier(this.config.identifier);

    // setup the listing controller
    this._listingController = new ListingController({
      decentralizer: this._decentralizer,
      encrypter: this._encrypter,
      identifier: this._identifer,
    });
  }

  // [re-]initialize everything
  async initialize() {
    await this._decentralizer.initialize();
    await this._encrypter.initialize();
    await this._identifer.initialize();
    await this._listingController.initialize();
  }

  async disconnect() {
    await this._decentralizer.disconnect();
  }

  // setter methods
  async setUserAddress(userAddress) {
    this._userAddress = userAddress;
  }

  async setEncryptionKey(ek) {
    this._encryptionKey = ek;
  }

  // calling ListingController#parseUPI
  async parseUPI(data) {
    try {
      return await this._listingController.parseUPI(data);
    } catch (e) {
      return null;
    }
  }

  // calling the ListingController
  async addListing(data, userAddress, ek) {
    try {
      await this._listingController.addData(
        data,
        userAddress || this._userAddress,
        ek || this._encryptionKey,
      );
      return true;
    } catch (e) {
      return e;
    }
  }

  async getLogsByAddress(userAddress) {
    return this._listingController.getLogsByAddress(
      userAddress || this._userAddress,
    );
  }

  async batchAddListings(listings = []) {
    return Promise.all(listings.map(this.addListing.bind(this)));
  }

  async getListings(ek, userAddress) {
    // get filtered logs
    const logs = await this.getLogsByAddress(userAddress || this._userAddress);

    // find the most recent IPFS hashes
    const hashesByUPI = {};
    logs.forEach(log => {
      hashesByUPI[log.upi] = log.hash;
    });
    const hashes = Object.values(hashesByUPI);

    // get the raw data buffers from IPFS
    const encryptedDataList = await Promise.all(
      hashes.map(hash => this._decentralizer.retrieveData(hash)),
    );

    // convert raw data buffers to strings
    const stringedDataList = encryptedDataList
      .map(edl => {
        try {
          return edl.toString();
        } catch (e) {
          return null;
        }
      })
      .filter(edl => edl);

    // decrypt it all
    const listingDataList = await Promise.all(
      stringedDataList.map(s =>
        this._encrypter.decrypt(ek || this._encryptionKey, s),
      ),
    );

    return listingDataList.filter(l => l);
  }
};
