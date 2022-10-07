import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"

import xchaingeAddressMumbai from "../broadcast/Xchainge.s.sol/80001/run-latest.json"
import xchaingeTokenAddressMumbai from "../broadcast/XchaingeToken.s.sol/80001/run-latest.json"


const TOKEN_ID = 10
async function cancelListing() {
  const chainId = network.config.chainId!.toString()

  const xchaingeAddress = xchaingeAddressMumbai["transactions"][0]["contractAddress"]
  const xchaingeTokenAddress = xchaingeTokenAddressMumbai["transactions"][0]["contractAddress"]

  const xchainge: Xchainge = await ethers.getContractAt("Xchainge", xchaingeAddress)
  const xchaingeToken: XchaingeToken = await ethers.getContractAt("XchaingeToken", xchaingeTokenAddress)

  const tx = await xchainge.cancelListing(xchaingeToken.address, TOKEN_ID)
  const txReceipt = await tx.wait(1)
  console.log(txReceipt)
  const tokenId = txReceipt.events![0].args!.tokenId
  console.log(`NFT with tokenId ${tokenId}  Canceled!`)
  if (chainId == "31337") {
    await moveBlocks(2, 1000)
  }
}

cancelListing()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
