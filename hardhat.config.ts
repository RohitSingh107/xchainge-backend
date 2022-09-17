import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import fs from "fs";
import "hardhat-preprocessor";
import "hardhat-deploy";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import "dotenv/config"


function getRemappings() {
  return fs
    .readFileSync("remappings.txt", "utf8")
    .split("\n")
    .filter(Boolean) // remove empty lines
    .map((line) => line.trim().split("="));
}

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  preprocess: {
    eachLine: (hre) => ({
      transform: (line: string) => {
        if (line.match(/^\s*import /i)) {
          getRemappings().forEach(([find, replace]) => {
            if (line.match(find)) {
              line = line.replace(find, replace);
            }
          });
        }
        return line;
      },
    }),
  },
  paths: {
    sources: "./src",
    cache: "./cache_hardhat",
  },

  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      chainId: 31337,
      // blockConfirmations: 1,
    },
    hardhat: {
      chainId: 31337,
      // blockConfirmations: 1,
    },
    rinkeby: {
      chainId: 4,
      // blockConfirmations: 6,
      url: process.env.RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },

    goerli: {
      chainId: 5,
      // blockConfirmations: 6,
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },

  },

  mocha: {
    timeout: 300000, // 300 seconds max
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },

  gasReporter: {
    // enabled: process.env.REPORT_GAS !== undefined,
    enabled: false,
    currency: "INR",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },






};

export default config;
