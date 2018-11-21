const Tegula = require("../src");

const run = async () => {
  try {
    // initialize
    const d = new Tegula()._decentralizer;
    await d.initialize();

    // add data
    const hash = await d.addData(
      JSON.stringify({ key1: "value1", key2: "value2" }),
    );
    console.log(hash);

    // retrieve data
    const data = await d.retrieveData(hash);
    console.log(JSON.parse(data));

    // add log
    await d.addLog({ id: "some-id", hash, metaKey: "meta-value" });

    // retrieve logs
    const logs = await d.retrieveLogs({ limit: 1 });
    console.log(logs.pop());
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
