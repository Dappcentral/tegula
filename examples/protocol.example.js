const utils = require("web3-utils");
const Tegula = require("../src");

const run = async () => {
  try {
    // initialize
    const p = new Tegula();
    await p.initialize();

    // get and set a new encryption key
    const ek = await p._encrypter.generate();
    await p.setEncryptionKey(ek);
    console.log("\nEncryption Key:", ek);
    // set a new address
    const address = utils.sha3(Math.random().toString());
    await p.setUserAddress(address);
    console.log("Random web3 address:", address);

    // add listing
    const listingData = { latitude: 124.456789, longitude: 113.456789, unitNumber: '4C', price: 2300000 };
    await p.addListing(listingData);

    // fetch list of listings
    const logs = await p.getLogsByAddress(address);
    console.log("Added logs:\n", logs);

    // fetch actual data
    const listings = await p.getListings();
    console.log("Listings:\n", listings);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
