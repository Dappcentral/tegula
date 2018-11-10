const Decentralizer = require("../src/decentralizer");

describe("Decentralizer", () => {
  const d = new Decentralizer({
    orbitdbOptions: {
      LOG_DATABASE: `test-logs-${Date.now()}`,
    },
  });

  after(async () => {
    await d.disconnect();
  });

  it("accepts a configuration", () => {
    const ne = new Decentralizer({ configTest: true });
    assert.equal(ne.config.configTest, true);
  });

  it("has a default configruation", () => {
    const ne = new Decentralizer();
    assert.deepStrictEqual(ne.config, {
      ipfsOptions: {
        EXPIREMENTAL: {
          pubsub: true,
        },
      },
      orbitDbOptions: {
        LOG_DATABASE: "imbrexer-logs",
      },
    });
  });

  it("can be initialized", async function initializeTest() {
    this.timeout(5000); // give us a little more room to initialize

    assert.equal(await d.initialize(), true);
    assert.equal(d.isInitialized, true);
    assert.notEqual(d._ipfs, undefined);
    assert.notEqual(d._orbitDb, undefined);
    assert.notEqual(d._logDb, undefined);
  });

  describe("#addData", () => {
    it("requires valid string data to add", async () => {
      assert.equal(await d.addData(), false);
      assert.equal(await d.addData(123), false);
      assert.notEqual(await d.addData("some data"), false);
    });

    it("returnes a consistent IPFS hash based on the content", async () => {
      const hash1 = await d.addData("some data");
      const hash2 = await d.addData("some data");

      assert.notEqual(hash1, false);
      assert.notEqual(hash2, false);
      assert.equal(hash1, hash2);
    });
  });

  describe("#retrieveData", () => {
    it("requires a hash as a param", async () => {
      assert.equal(await d.retrieveData(), false);
      assert.notEqual(
        await d.retrieveData("QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS"),
        false,
      );
    });

    it("retrieves the original data", async () => {
      assert.equal(
        await d.retrieveData("QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS"),
        "some data",
      );
    });
  });

  describe("#addLog", () => {
    it("requires a valid JS object as a param", async () => {
      assert.equal(await d.addLog(), false);
      assert.equal(await d.addLog("test data"), false);
      assert.notEqual(await d.addLog({ a: "b" }), false);
    });

    it("returns an IPFS hash on success", async () => {
      const hash = await d.addLog({ a: "b" });
      assert.equal(!!hash, true);
      assert.equal(hash.startsWith("Qm"), true);
    });
  });

  describe("#retrieveLogs", () => {
    // NOTE: we loaded two logs above
    it("retrieves all availabe logs", async () => {
      const logs = await d.retrieveLogs();
      assert.equal(logs.length, 2);
      assert.equal(logs[0].a, "b");
      assert.equal(
        logs.every(l => Object.keys(l).includes("_timestamp")),
        true,
      );
    });
  });
});
