const Protocol = require("../src/protocol");

describe("Protocol", () => {
  const p = new Protocol({
    decentralizer: {
      orbitdbOptions: {
        LOG_DATABASE: `test-logs-${Date.now()}`,
      },
    },
  });
  const userAddress = "user-address";
  const ek = "some key";

  after(async () => {
    await p.disconnect();
  });

  it("can be initialized", async function initializeTest() {
    this.timeout(5000); // give us a little more room to initialize

    assert.notEqual(await p.initialize().catch(() => false), false);
  });

  it("accepts a configuration", () => {
    const np = new Protocol({ configTest: true });
    assert.deepStrictEqual(np.config, { configTest: true });
  });

  describe("#setUserAddress", () => {
    it("can set the protocol user address", async () => {
      assert.equal(p._userAddress, undefined);
      await p.setUserAddress(userAddress);
      assert.equal(p._userAddress, userAddress);
    });
  });

  describe("#setEncryptionKey", () => {
    it("can set the protocol encryption key", async () => {
      assert.equal(p._encryptionKey, undefined);
      await p.setEncryptionKey(ek);
      assert.equal(p._encryptionKey, ek);
    });
  });

  describe("#addListing", () => {
    // NOTE: we already set the userAddress and encryptionKey above
    it("returns an error on failure", async () => {
      assert.notEqual(await p.addListing(), true);
    });

    it("returns true on success", async () => {
      assert.equal(
        await p.addListing({ lat: 123.456789, lng: 123.456789 }),
        true,
      );
    });
  });

  describe("#getLogsByAddress", () => {
    // NOTE: we added a single listing above
    it("returns all matching logs", async () => {
      assert.equal((await p.getLogsByAddress()).length, 1);
      assert.equal((await p.getLogsByAddress("another address")).length, 0);
    });
  });

  describe("#batchAddListings", () => {
    // NOTE: we added a signle listing already
    it("can add multiple listings at once", async () => {
      const results = await p.batchAddListings([
        {},
        { lat: 123.456789, lng: 123.456789, unitId: "abc" },
      ]);
      assert.notEqual(results[0], true);
      assert.equal(results[1], true);
      assert.equal((await p.getLogsByAddress()).length, 2);
    });
  });

  describe("#getListings", () => {
    // NOTE: we've now added 2 listings above
    it("returns all listings by user address", async () => {
      assert.equal((await p.getListings(ek, "another address")).length, 0);
      const listings = await p.getListings();
      assert.equal(listings.length, 2);
      assert.deepStrictEqual(listings, [
        {
          lat: 123.456789,
          lng: 123.456789,
        },
        {
          lat: 123.456789,
          lng: 123.456789,
          unitId: "abc",
        },
      ]);
    });
  });
});