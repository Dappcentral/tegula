const IPFS = require("ipfs");
const IpfsApi = require("ipfs-api");
const OrbitDb = require("orbit-db");

module.exports = class Decentralizer {
  // use contractor class to define the config values
  constructor(config = {}) {
    this.config = {
      ...config,
      ipfsOptions: {
        config: {
          Addresses: {
            Swarm: [
              "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
            ],
          },
        },
        ...config.ipfsOptions,
      },
      orbitdbOptions: {
        // NOTE: this needs to be overriden
        LOG_DATABASE: `tegula-logs-${Math.random()}`,
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

    try {
      // create the ipfs instance
      if (this.config.ipfsOptions.apiUri) {
        this._ipfs = IpfsApi(this.config.ipfsOptions.apiUri);
      } else {
        this._ipfs = await IPFS.create(this.config.ipfsOptions);
      }

      // create the orbitDb instance
      this._orbitDb = await OrbitDb.createInstance(this._ipfs);

      // define the specific logDb
      this._logDb = await this._orbitDb.log(
        this.config.orbitdbOptions.LOG_DATABASE,
        { localOnly: false, sync: true },
      );
      console.log("OrbitDB synced with:", this._logDb.address.toString());

      // load the logDb so we have it
      await this._logDb.load();

      // resolve the initialize promise
      this.isInitialized = true;
      return true;
    } catch (err) {
      // if any of the above fails, reject the promise
      console.log(err);
      return err;
    }
  }

  async disconnect() {
    try {
      await this._orbitDb.disconnect();
      await this._ipfs.shutdown();
      return true;
    } catch (e) {
      return false;
    }
  }

  // method to store data via ipfs
  async addData(data) {
    if (!data || typeof data !== "string") {
      // make sure we're saving something valid
      return false;
    }

    // add content and return hash
    const [{ hash }] = await this._ipfs.add(data);
    return hash;
  }

  // method to retrieve data from ipfs
  async retrieveData(hash) {
    if (!hash) {
      // make sure we're given a hash
      return false;
    }

    // fetch the data from ipfs
    return this._ipfs.cat(hash);
  }

  // method to add logs
  async addLog(data = {}) {
    if (!data || typeof data !== "object" || !Object.keys(data).length) {
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
