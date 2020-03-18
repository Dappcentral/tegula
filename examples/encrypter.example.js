const Tegula = require("../src");

const run = async () => {
  try {
    // initialize
    const e = new Tegula()._encrypter;
    await e.initialize();

    const ek = await e.generate();
    console.log("Encryption Key:", ek);

    const data = { a: "value 1", b: "value 2" };
    const encrypted = await e.encrypt(ek, data);
    console.log("Encrypted data:", encrypted);

    const decrypted = await e.decrypt(ek, encrypted);
    console.log("Decrypted data:", decrypted);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
