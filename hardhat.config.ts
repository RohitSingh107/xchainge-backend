import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import fs from "fs";
import "hardhat-preprocessor";

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
};

export default config;
