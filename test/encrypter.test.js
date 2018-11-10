const Encrypter = require("../src/encrypter");

describe("Encrypter", () => {
  const e = new Encrypter();

  it("accepts a configuration", () => {
    const ne = new Encrypter({ configTest: true });
    assert.equal(ne.config.configTest, true);
  });

  it("can be initialized", async () => {
    assert.equal(await e.initialize(), true);
    assert.equal(e.isInitialized, true);
  });

  describe("#encrypt", () => {
    it("requires a string encryption key and data as params", async () => {
      assert.equal(await e.encrypt(), null);
      assert.equal(await e.encrypt(123, "some data"), null);
      assert.equal(await e.encrypt("some key"), null);
      assert.notEqual(await e.encrypt("some key", "some data"), null);
    });

    it("always uniquely encrypts data", async () => {
      const eds1 = await e.encrypt("some key", "some data");
      const eds2 = await e.encrypt("some key", "some data");

      assert.notEqual(eds1, null);
      assert.notEqual(eds2, null);
      assert.notEqual(eds1, eds2);
    });
  });

  describe("#decrypt", () => {
    it("requires a string encryption key and string data as params", async () => {
      assert.equal(await e.decrypt(), null);
      assert.equal(await e.decrypt(123, {}), null);
      assert.equal(await e.decrypt("some key", {}), null);
      assert.equal(await e.decrypt(123, "some encrypted data"), null);
      assert.notEqual(await e.decrypt("some key", "some encrypted data"), null);
    });

    it("returns an empty string with bad encrypted data", async () => {
      assert.equal(await e.decrypt("some key", "some encrypted data"), "");
    });

    it("successfully decrypts valid data with the right encryption key", async () => {
      assert.equal(
        await e.decrypt(
          "some key",
          "U2FsdGVkX1+kIDrnV3wxnbesK3BEbFeCuX5M4wgBv+0=",
        ),
        "some data",
      );
      assert.equal(
        await e.decrypt(
          "some key",
          "U2FsdGVkX1/O62kVLtdjT65buF5fNVrzmmufQY7S6vw=",
        ),
        "some data",
      );
    });

    it("tries JSON.parse with decrypted data", async () => {
      const encrypted = await e.encrypt("some key", { a: "b" });
      assert.deepStrictEqual(await e.decrypt("some key", encrypted), {
        a: "b",
      });
    });
  });

  describe("#generate", () => {
    it("returns random encryption keys", async () => {
      const ek1 = await e.generate();
      const ek2 = await e.generate();

      assert.notEqual(ek1, null);
      assert.notEqual(ek2, null);
      assert.notEqual(ek1, ek2);
    });
  });
});
