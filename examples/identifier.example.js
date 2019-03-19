const Tegula = require("../src");

const run = async () => {
  try {
    // initialize
    const i = new Tegula()._identifer;
    await i.initialize();

    // normalize address
    /*const normalized = await i.normalizeAddress(
      "123 APPLE STREET, new york, ny 12345",
    );*/
    //console.log(normalized);

    // get coordinates
    /*const {
      latitude,
      longitude,
      unitNumber,
    } = await i.parseAddressToCoordinates(normalized);
    console.log(latitude, longitude, unitNumber);*/

    // get UPI hash
    const hash = await i.parseCoordinatesToUPI(42.2566425, -83.7830953, 'Alder');
    console.log(hash);

    // all together now
    const UPI = await i.parseAddressToUPI("123 APPLE ST. NY, NY");
    console.log(UPI);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
