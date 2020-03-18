const Tegula = require("../src");

const run = async () => {
  try {
    // initialize
    const i = new Tegula()._identifer;
    await i.initialize();

    // NOTE: disabled without Google Maps API Key
    // normalize address
    // const normalized = await i.normalizeAddress(
    //   "123 APPLE STREET, new york, ny 12345",
    // );
    // console.log(normalized);

    // NOTE: disabled without Google Maps API Key
    // get coordinates
    // const {
    //   latitude,
    //   longitude,
    //   unitNumber,
    // } = await i.parseAddressToCoordinates(normalized);
    // console.log(latitude, longitude, unitNumber);

    // get UPI hash
    const hash = await i.parseCoordinatesToUPI(
      42.2566425,
      -83.7830953,
      "Alder",
    );
    console.log("UPI from coordinates:", hash);

    // NOTE: disabled without Google Maps API Key
    // all together now
    // const UPI = await i.parseAddressToUPI("123 APPLE ST. NY, NY");
    // console.log(UPI);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
