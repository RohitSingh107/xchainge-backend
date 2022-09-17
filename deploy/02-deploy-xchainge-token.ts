import { ethers, network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {verify} from "../utils/verify"

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
const waitBlockConfirmations = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATIONS

module.exports = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  log("----------------------------------------------------")
  const args: any[] = []
  const xchaingeToken = await deploy("XchaingeToken", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: waitBlockConfirmations,
  })

  // Verify the deployment
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {

      log("Verifying...")
      await verify(xchaingeToken.address, args)
  }
  log("----------------------------------------------------")

}

module.exports.tags = ["all", "xchainge-token"]
