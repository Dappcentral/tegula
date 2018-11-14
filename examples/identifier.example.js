const Protocol = require("../src");

const run = async () => {
  try {
    // initialize
    const i = new Protocol()._identifer;
    await i.initialize();

    // normalize address
    const normalized = await i.normalizeAddress(
      "123 APPLE STREET, new york, ny 12345",
    );
    console.log(normalized);

    // get coordinates
    const {
      latitude,
      longitude,
      unitNumber,
    } = await i.parseAddressToCoordinates(normalized);
    console.log(latitude, longitude, unitNumber);

    // get UPI hash
    const hash = await i.parseCoordinatesToUPI(latitude, longitude, unitNumber);
    console.log(hash);

    // all together now
    const UPI = await i.parseAddressToUPI("123 APPLE ST. NY, NY");
    console.log(UPI);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
