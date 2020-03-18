const Tegula = require("./src");

const tegula = new Tegula({
  decentralizer: {
    orbitdbOptions: {
      LOG_DATABASE:
        process.env.LOG_DATABASE || `replicator-logs-${Math.random()}`,
    },
  },
});

const run = async () => {
  await tegula.initialize();

  const addr = tegula._decentralizer._logDb.address.toString();
  console.log("\nReady to replicate");
  console.log("Listing on", addr, "\n");

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

  const syncAgain = async () => {
    const message = `Hello from ${process.env.USER}`;
    console.log("Sending message:", message);
    await tegula._decentralizer.addLog({ message });
    await checkLogs();
    await checkPeers();

    setTimeout(() => syncAgain(), 5000);
  };

  syncAgain();
};

run().catch(err => {
  console.log(err);
  process.exit();
});
