const Decentralizer = require("../src/decentralizer");
const Encrypter = require("../src/encrypter");
const Identifier = require("../src/identifier");
const ListingController = require("../src/listing-controller");

describe("ListingController", () => {
  const lc = new ListingController({
    decentralizer: new Decentralizer({
      orbitdbOptions: {
        LOG_DATABASE: `test-logs-${Date.now()}`,
      },
    }),
    encrypter: new Encrypter(),
    identifier: new Identifier(),
  });
  const userAddress = "user-address";

  after(async () => {
    await lc._decentralizer.disconnect();
  });

  it("can be initialized", async function initialize() {
    this.timeout(5000); // give us a little more room to initialize

    assert.equal(await lc.initialize(), true);
    assert.equal(await lc.isInitialized, true);
    assert.equal(await lc._decentralizer.isInitialized, true);
    assert.equal(await lc._encrypter.isInitialized, true);
    assert.equal(await lc._identifier.isInitialized, true);
  });

  describe("#normalizeData", () => {
    it("returns what it's given", async () => {
      const data = { a: "b" };
      assert.deepStrictEqual(await lc.normalizeData(data), data);
    });
  });

  describe("#validateUserAddress", () => {
    it("validates a given user address as an Ethereum address", async () => {
      assert.equal(!!(await lc.validateUserAddress()), false);
      assert.equal(!!(await lc.validateUserAddress("")), false);
      assert.equal(!!(await lc.validateUserAddress("testing")), true);
    });
  });

  describe("#addData", () => {
    it("fails with bad params", async () => {
      assert.equal(await lc.addData().catch(() => false), false);
      assert.equal(
        await lc
          .addData(
            { lat: 123.456789, lng: 123.456789 },
            userAddress,
            "some key",
          )
          .catch(() => false),
        true,
      );
    });

    it("it fails if it can't parse a UPI", async () => {
      assert.equal(
        await lc.addData({}, userAddress, "some key").catch(() => false),
        false,
      );
      assert.equal(
        await lc
          .addData(
            { lat: 123.456789, lng: 123.456789 },
            userAddress,
            "some key",
          )
          .catch(() => false),
        true,
      );
    });

    it("returns true on success", async () => {
      assert.equal(
        await lc.addData(
          { lat: 123.456789, lng: 123.456789 },
          userAddress,
          "some key",
        ),
        true,
      );
    });
  });

  describe("#getLogsByAddress", () => {
    // NOTE: we added 3 listings above
    it("retrieves all logs by user address", async () => {
      const logs = await lc.getLogsByAddress(userAddress);
      assert.equal(logs.length, 3);
    });
  });
});
