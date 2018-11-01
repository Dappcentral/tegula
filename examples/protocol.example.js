const web3 = require("web3");
const Protocol = require("../src");

const run = async () => {
  try {
    // initialize
    const p = new Protocol();
    await p.initialize();

    // get and set a new encryption key
    const ek = await p._encrypter.generate();
    console.log(ek);
    await p.setEncryptionKey(ek);

    // set a new address
    const address = web3.utils.sha3(Math.random().toString());
    await p.setUserAddress(address);
    console.log(address);

    // add listing
    await p.batchAddListings([
      { fullAddress: "123 apple street" },
      { fullAddress: "456 banana way" },
    ]);

    // fetch list of listings
    const logs = await p.getLogsByAddress(address);
    console.log(logs);

    // fetch actual data
    const listings = await p.getListings();
    console.log(listings);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
