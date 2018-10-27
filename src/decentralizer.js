const IPFS = require("ipfs");
const OrbitDb = require("orbit-db");

module.exports = class Decentralizer {
  // use contractor class to define the config values
  constructor(config = {}) {
    this.config = {
      ...config,
      ipfsOptions: {
        EXPIREMENTAL: {
          // OrbitDb relies on IPFS pub/sub for p2p connections
          pubsub: true,
        },
        ...config.ipfsOptions,
      },
      orbitDbOptions: {
        // this is our default log database
        LOG_DATABASE: "imbrexer-logs",
        ...config.orbitdbOptions,
      },
    };

    this.isInitialized = false;
  }

  // define an async method for initializing IPFS and OrbitDb
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    // create the ipfs instance
    this._ipfs = new IPFS(this.config.ipfsOptions);

    return new Promise((res, rej) => {
      // reject on errors
      this._ipfs.on("error", rej);

      // setup OrbitDb after IPFS
      this._ipfs.on("ready", async () => {
        try {
          // create the orbitDb instance
          this._orbitDb = new OrbitDb(this._ipfs);

          // define the specific logDb
          this._logDb = await this._orbitDb.log(
            this.config.orbitDbOptions.LOG_DATABASE,
          );

          // load the logDb so we have it
          await this._logDb.load();

          // resolve the initialize promise
          this.isInitialized = true;
          res(true);
        } catch (err) {
          // if any of the above fails, reject the promise
          rej(err);
        }
      });
    });
  }

  // method to store data via ipfs
  async addData(data) {
    if (!data || typeof data !== "string") {
      // make sure we're saving something valid
      return false;
    }

    // convert stringified data to buffer
    const content = this._ipfs.types.Buffer.from(data);

    // add content and return hash
    const [{ hash }] = await this._ipfs.files.add(content);
    return hash;
  }

  // method to retrieve data from ipfs
  async retrieveData(hash) {
    if (!hash) {
      // make sure we're given a hash
      return false;
    }

    // fetch the data from ipfs
    return this._ipfs.files.cat(hash);
  }

  // method to add logs
  async addLog(data = {}) {
    if (!data || !Object.keys(data).length) {
      // make sure we have something to log
      return false;
    }

    // wait for the log to be added
    return this._logDb.add({ ...data, _timestamp: Date.now() });
  }

  // method to retrieve logs
  async retrieveLogs(opts = {}) {
    const logs = this._logDb.iterator({ limit: -1, ...opts }).collect();

    const parsedLogs = logs.map(l => l.payload.value);
    parsedLogs.sort((a, b) => {
      const v1 = a._timestamp;
      const v2 = b._timestamp;

      if (v1 > v2) return 1;
      if (v2 > v1) return -1;
      return 0;
    }, []);

    return parsedLogs;
  }
};
