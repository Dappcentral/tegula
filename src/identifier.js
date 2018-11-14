const web3 = require("web3");

module.exports = class Identifier {
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

  // method to convert lat, lng, unit to UPI hash
  // eslint-disable-next-line class-methods-use-this
  async parseCoordinatesToUPI(lat, lng, unit = "") {
    if (!lat || !lng || typeof lat !== "number" || typeof lng !== "number") {
      // make sure we have valid inputs here
      return null;
    }

    // make sure coordinates include signs
    const parsedLat = lat < 0 ? lat.toString() : `+${lat.toString()}`;
    const parsedLng = lng < 0 ? lng.toString() : `+${lng}`;
    const parsedUnit = `${unit || ""}`.trim().toUpperCase();

    if (
      !parsedLat.includes(".") ||
      !parsedLng.includes(".") ||
      parsedLat.split(".")[1].length < 6 ||
      parsedLng.split(".")[1].length < 6
    ) {
      // make sure we're given enough decimals of precision
      return null;
    }

    // create UPI by joining the parts
    const UPI = [parsedLat, parsedLng, parsedUnit].join("||");

    // return the sha3 hash for consistent lengths
    return web3.utils.sha3(UPI);
  }

  // quick normalization helper
  // eslint-disable-next-line class-methods-use-this
  async normalizeAddress(address) {
    const knownAbbrs = {
      "air force base": "afb",
      apartment: "apt",
      avenue: "ave",
      basement: "bsmt",
      boulevard: "blvd",
      building: "bldg",
      bypass: "byp",
      center: "ctr",
      circle: "cir",
      court: "ct",
      crescent: "cres",
      crossing: "xing",
      department: "dept",
      drive: "dr",
      east: "e",
      expressway: "expy",
      extension: "ext",
      floor: "fl",
      fort: "ft",
      freeway: "fwy",
      heights: "hts",
      highway: "hwy",
      hospital: "hosp",
      institute: "inst",
      international: "intl",
      junction: "jct",
      lake: "lk",
      lakes: "lks",
      lane: "ln",
      meeting: "mtg",
      memorial: "mem",
      mount: "mt",
      mountain: "mtn",
      national: "nat",
      "naval air station": "nas",
      north: "n",
      northeast: "ne",
      northwest: "nw",
      parkway: "pky",
      place: "pl",
      point: "pt",
      river: "riv",
      road: "rd",
      room: "rm",
      "rural route": "rr",
      saint: "st",
      south: "s",
      southeast: "se",
      southwest: "sw",
      square: "sq",
      station: "sta",
      street: "st",
      suite: "ste",
      terminal: "term",
      terrace: "ter",
      trail: "trl",
      trailer: "trlr",
      turnpike: "tpk",
      university: "univ",
      west: "w",
    };

    // make it lowercase
    let clean = (address || "").toLowerCase();
    Object.entries(knownAbbrs).forEach(([k, v]) => {
      // replace all the known abbreviations
      clean = clean.replace(new RegExp(` ${k}( ?)`, "g"), ` ${v}$1`);
    });

    // strip out any non-alphanumeric/space characters
    clean = clean.replace(/[^0-9a-z ]/g, "");
    return clean;
  }

  // placeholder method for utlizing a geolocation API
  async parseAddressToCoordinates(address) {
    if (!address || !this.config.googleMapsApiKey || !module) {
      // make sure we have an address and a google maps config
      // also the @google/maps package requires running in node
      //    sooo this won't work in a browser
      //    https://github.com/googlemaps/google-maps-services-js#attention
      return {};
    }

    if (!this._googleMapsClient) {
      // eslint-disable-next-line global-require
      this._googleMapsClient = require("@google/maps").createClient({
        key: this.config.googleMapsApiKey,
        Promise,
      });
    }

    const payload = {};

    const { json } = await this._googleMapsClient
      .geocode({ address })
      .asPromise();

    if (json.results && json.results[0]) {
      // make sure we have a valid result from Google
      const [place] = json.results;

      // pull out the lat and lng
      if (place.geometry && place.geometry.location) {
        payload.latitude = place.geometry.location.lat;
        payload.longitude = place.geometry.location.lng;
      }

      // figure out the unit
      if (place.address_components instanceof Array) {
        const subpremise = place.address_components.find(
          ac =>
            ac && ac.types instanceof Array && ac.types.includes("subpremise"),
        );
        if (subpremise) {
          payload.unitNumber = subpremise.short_name;
        }
      }
    }

    return payload;
  }

  // putting it altogether as a helper method
  async parseAddressToUPI(address) {
    if (!address) {
      return null;
    }

    const normalized = await this.normalizeAddress(address);
    const {
      latitude,
      longitude,
      unitNumber,
    } = await this.parseAddressToCoordinates(normalized);
    const UPI = await this.parseCoordinatesToUPI(
      latitude,
      longitude,
      unitNumber,
    );

    return UPI;
  }
};
