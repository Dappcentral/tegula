const Tegula = require("../src");

const run = async () => {
  try {
    // initialize
    const e = new Tegula()._encrypter;
    await e.initialize();

    const ek = await e.generate();
    console.log(ek);

    const data = { a: "value 1", b: "value 2" };
    const encrypted = await e.encrypt(ek, data);
    console.log(encrypted);

    const decrypted = await e.decrypt(ek, encrypted);
    console.log(decrypted);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
