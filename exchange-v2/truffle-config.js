require('dotenv').config()
const HDWalletProvider = require("@truffle/hdwallet-provider")

function createNetwork(name, id) {
  try {
    return {
      provider: new HDWalletProvider(process.env.MNEMONIC, process.env.PROVIDER),
      network_id: id,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 1000000
    }
  } catch (e) {
    return null
  }
}

module.exports = {
	api_keys: {
    bscscan: process.env.BSC_API_KEY,
    etherscan: process.env.ETHERSCAN_API_KEY,
    polygonscan: process.env.POLYGON_API_KEY
  },

	plugins: [
    'truffle-plugin-verify'
  ],

  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
      gas: 6021975,
    },
    mainnet: createNetwork("mainnet", '1'),
    bsc: createNetwork("bsc", '56'),
    polygon: createNetwork("polygon", '137'),
    mumbai: createNetwork("mumbai", '80001')
  },

  compilers: {
    solc: {
      version: "0.7.6",
      settings: {
        optimizer: {
          enabled : true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    }
  }
}
