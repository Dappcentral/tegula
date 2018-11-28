const Tegula = require("./src");

const tegula = new Tegula();

const run = async () => {
  await tegula.initialize();
  console.log("Initialized!");

  const addr = tegula._decentralizer._logDb.address.toString();
  console.log("Tegula logs at", addr);

  const checkLogs = async () => {
    const logs = await tegula._decentralizer.retrieveLogs({ limit: -1 });
    console.log("replicated count", logs.length);
  };

  const checkPeers = async () => {
    const peers = await tegula._decentralizer._ipfs.pubsub.peers(addr);
    console.log(`connected to ${peers.length} peers`);
  };

  tegula._decentralizer._logDb.events.on("replicated", async () => {
    await checkLogs();
    await checkPeers();
  });

  setTimeout(async () => {
    await checkPeers();
  }, 5000);
};

run().catch(err => {
  console.log(err);
  process.exit();
});
