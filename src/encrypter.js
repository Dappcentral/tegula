const CryptoJS = require("crypto-js");
const web3 = require("web3");

module.exports = class Encrypter {
  // use contractor class to define the config values
  constructor(config = {}) {
    this.config = {
      ...config,
    };

    this.isInitialized = false;
  }

  // placeholder method for now
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    this.isInitialized = true;
    return true;
  }

  // method to encrypt data given an encryption key
  // eslint-disable-next-line class-methods-use-this
  async encrypt(ek, data) {
    if (!ek || !data || typeof ek !== "string") {
      return null;
    }

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), ek);
    return encrypted.toString();
  }

  // method to encrypt data given an encryption key
  // eslint-disable-next-line class-methods-use-this
  async decrypt(ek, encryptedData) {
    if (
      !ek ||
      !encryptedData ||
      typeof ek !== "string" ||
      typeof encryptedData !== "string"
    ) {
      return null;
    }

    // parse to bytes and the as a string
    const bytes = CryptoJS.AES.decrypt(encryptedData, ek);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    try {
      // try using JSON.parse (assuming we had used the encrypt method above)
      return JSON.parse(decrypted);
    } catch (e) {
      return decrypted;
    }
  }

  // method to generate a new encryption key
  // eslint-disable-next-line class-methods-use-this
  async generate() {
    return web3.utils.randomHex(32);
  }
};
