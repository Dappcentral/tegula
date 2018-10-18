const { Decentralizer } = require("../src");

const run = async () => {
  try {
    // initialize
    const d = new Decentralizer();
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
    await d.addLog("some-id", hash, { metaKey: "meta-value" });

    // retrieve logs
    const [log] = await d.retrieveLogs({ limit: 1 });
    console.log(log);
  } catch (err) {
    console.log(err);
  }
};

run().then(() => process.exit());
