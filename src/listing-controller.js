const web3 = require("web3");
const listingFields = require("./assets/listing-fields");

const toCamelCase = (str = "") =>
  str.replace(/[-_]([a-z])/g, g => g[1].toUpperCase());

module.exports = class ListingController {
  constructor({ decentralizer, encrypter, identifier }) {
    this._decentralizer = decentralizer;
    this._encrypter = encrypter;
    this._identifier = identifier;

    this.isInitialized = false;
  }

  // make sure everything is ready to go
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    await Promise.all([
      this._decentralizer.initialize(),
      this._encrypter.initialize(),
      this._identifier.initialize(),
    ]);

    this.isInitialized = true;
    return true;
  }

  // simple method to return the availabe listing field keys
  // can/should be augmented later with a full schema validation
  // eslint-disable-next-line class-methods-use-this
  async getListingFields() {
    return listingFields.slice();
  }

  // method to normalize listing data based on known standards
  // this is mostly a placeholder for now,
  // but can be flushed out further as we go
  async normalizeData(data) {
    const newData = {};

    const validKeys = await this.getListingFields();
    validKeys.push("fullAddress");

    Object.entries(data || {}).forEach(([ok, v]) => {
      const k = toCamelCase(ok);
      if (k.startsWith("_") || validKeys.includes(k)) {
        if (v || [0, false].includes(v)) {
          newData[k] = v;
        }
      }
    });

    if (!newData.fullAddress) {
      // make sure we have a fullAddress if possible
      newData.fullAddress = [
        newData.address,
        newData.city,
        newData.region,
        newData.zipcode,
        newData.country,
      ]
        .filter(v => v && v.length)
        .join(" ");

      if (!newData.fullAddress) {
        delete newData.fullAddress;
      }
    }

    if (newData.price) {
      // clean up the price
      newData.price = `${newData.price}`.replace(/\$/g, "");
    }

    return newData;
  }

  // method to validate userAddress
  // eslint-disable-next-line class-methods-use-this
  async validateUserAddress(userAddress) {
    return web3.utils.isAddress(userAddress);
  }

  // method to compute the UPI of given data
  async parseUPI(data) {
    if (!data || typeof data !== "object") {
      return null;
    }

    // normalize the data first to be safe
    const normalized = await this.normalizeData(data);

    // figure out the UPI by coordinates
    let UPI = await this._identifier.parseCoordinatesToUPI(
      normalized.latitude,
      normalized.longitude,
      normalized.unitNumber,
    );
    if (!UPI) {
      // if we can't get an UPI using the coordinates, then try by full address
      UPI = await this._identifier.parseAddressToUPI(data.fullAddress);
    }

    return UPI;
  }

  // method to distribute data
  async addData(data, userAddress, ek) {
    if (!data || !userAddress || !ek) {
      // make sure we have valid params
      throw new Error("invalid params");
    }

    // normalize the data
    const normalized = await this.normalizeData(data);

    // parse the UPI
    const UPI = await this.parseUPI(normalized);
    if (!UPI) {
      // if we failed to find a UPI, say so
      throw new Error("cannot find valid UPI");
    }

    // now encrypt the data
    const encrypted = await this._encrypter.encrypt(ek, normalized);
    if (!encrypted) {
      // for whatever reason we failed to encrypt
      throw new Error("failed encrypting data");
    }

    // finally decentralize this
    const hash = await this._decentralizer.addData(encrypted);
    if (!hash) {
      // something went wrong here
      throw new Error("failed sending data to IPFS");
    }

    // and log the action
    await this._decentralizer.addLog({
      address: userAddress,
      logType: "add-listing",
      hash,
      upi: UPI,
    });

    return true;
  }

  // method to fetch logs for an address
  async getLogsByAddress(userAddress) {
    if (!this.validateUserAddress(userAddress)) {
      return [];
    }

    const logs = await this._decentralizer.retrieveLogs();
    return logs.filter(l => l.address === userAddress);
  }
};
