import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import { task } from "hardhat/config";
import { HttpNetworkHDAccountsConfig } from "hardhat/types";
dotenv.config();

const { ETHERSCAN_API_KEY, MNEMONIC, GOERLI_TEST_RPC_URL, AVALANCHE_FUJI_C_RPC_URL } = process.env;
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.16",
      },
      {
        version: "0.6.6",
      },
      {
        version: "0.6.12",
      },
      {
        version: "0.4.18",
      },
    ],
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 21,
    gasPriceApi: `https://api.etherscan.io/api?module=proxy&action=eth_gasPrice&apikey=${ETHERSCAN_API_KEY}`,
  },
  networks: {
    hardhat: {
      localhost: {
        url: "http://localhost:8545",
      },
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      blockGasLimit: 0xafffff,
    },
    /*
    mnemonic: string;
    initialIndex: number;
    count: number;
    path: string;
    passphrase: string; 
  */
    testnet: {
      url: AVALANCHE_FUJI_C_RPC_URL,
      chainId: 43113,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 4,
        passphrase: "",
      } as HttpNetworkHDAccountsConfig,
    },
    goerli: {
      url: GOERLI_TEST_RPC_URL,
      chainId: 5,
      accounts: {
        mnemonic: MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 4,
        passphrase: "",
      },
    },
  },

  // contractSizer: {
  //   alphaSort: true,
  //   disambiguatePaths: false,
  //   runOnCompile: true,
  //   strict: true,
  //   only: [],
  // },
};


export default config;
