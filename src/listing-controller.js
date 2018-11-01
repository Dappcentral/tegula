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

  // method to normalize listing data based on known standards
  // TODO: placeholder method for now
  // eslint-disable-next-line class-methods-use-this
  async normalizeData(data) {
    const newData = {};

    Object.entries(data || {}).forEach(([k, v]) => {
      // TODO: do something here
      newData[k] = v;
    });

    return newData;
  }

  // method to validate userAddress
  // TODO: placeholder method for now
  // eslint-disable-next-line class-methods-use-this
  async validateUserAddress(userAddress) {
    return userAddress && userAddress.length;
  }

  // method to distribute data
  async addData(data, userAddress, ek) {
    if (!data || !userAddress || !ek) {
      // make sure we have valid params
      throw new Error("invalid params");
    }

    // normalize the data
    const normalized = await this.normalizeData(data);

    // figure out the UPI by coordinates
    let UPI = await this._identifier.parseCoordinatesToUPI(
      normalized.lat,
      normalized.lng,
      normalized.unitId,
    );
    if (!UPI) {
      // if we can't get an UPI using the coordinates, then try by full address
      UPI = await this._identifier.parseAddressToUPI(data.fullAddress);
    }

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
