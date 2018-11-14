const Identifier = require("../src/identifier");

describe("Identifier", () => {
  const i = new Identifier();

  it("accepts a configuration", () => {
    const ni = new Identifier({ configTest: true });
    assert.equal(ni.config.configTest, true);
  });

  it("can be initialized", async () => {
    assert.equal(await i.initialize(), true);
    assert.equal(i.isInitialized, true);
  });

  describe("#parseCoordinatesToUPI", () => {
    it("requires numerical lat and lng params", async () => {
      assert.equal(await i.parseCoordinatesToUPI(), null);
      assert.equal(await i.parseCoordinatesToUPI("test", 123.456789), null);
    });

    it("requires lat and lng params with valid precision", async () => {
      assert.equal(await i.parseCoordinatesToUPI(123.45678, 123.456789), null);
      assert.notEqual(
        await i.parseCoordinatesToUPI(123.456789, 123.456789),
        null,
      );
    });

    it("accepts an optional unit", async () => {
      const upi1 = await i.parseCoordinatesToUPI(123.456789, 123.456789);
      const upi2 = await i.parseCoordinatesToUPI(
        123.456789,
        123.456789,
        "unit-id",
      );

      assert.notEqual(upi1, null);
      assert.notEqual(upi2, null);
      assert.notEqual(upi1, upi2);
    });

    it("consistently returns UPIs given the same inputs", async () => {
      const upi1 = await i.parseCoordinatesToUPI(123.456789, 123.456789);
      const upi2 = await i.parseCoordinatesToUPI(123.456789, 123.456789);

      assert.notEqual(upi1, null);
      assert.equal(upi1, upi2);
    });
  });

  describe("#normalizeAddress", () => {
    it("lowercases the input", async () => {
      assert.equal(await i.normalizeAddress("123 APPLE"), "123 apple");
    });

    it("replaces known long-form terms with abbreviations", async () => {
      assert.equal(
        await i.normalizeAddress("123 apple street"),
        "123 apple st",
      );
      assert.equal(
        await i.normalizeAddress("123 apple avenue nyc"),
        "123 apple ave nyc",
      );
    });

    it("strips out any non alphanumeric/space characters", async () => {
      assert.equal(
        await i.normalizeAddress("123 apple street #47 - nyc, ny"),
        "123 apple st 47  nyc ny",
      );
    });
  });

  describe("parseAddressToCoordinates", () => {
    it("requires an input", async () => {
      assert.deepStrictEqual(await i.parseAddressToCoordinates(), {});
    });
  });

  describe("parseAddressToUPI", () => {
    it("requires an input", async () => {
      assert.equal(await i.parseAddressToUPI(), null);
    });
  });
});
