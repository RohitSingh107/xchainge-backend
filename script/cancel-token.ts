import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"

const TOKEN_ID = 9
async function cancelListing() {
  const xchainge: Xchainge = await ethers.getContract("Xchainge")
  const xchaingeToken: XchaingeToken = await ethers.getContract("XchaingeToken")
  const tx = await xchainge.cancelListing(xchaingeToken.address, TOKEN_ID)
  const txReceipt = await tx.wait(1)
  console.log(txReceipt)
  const tokenId = txReceipt.events[0].args.tokenId
  console.log(`NFT with tokenId ${tokenId}  Canceled!`)
  if (network.config.chainId.toString() == "31337") {
    await moveBlocks(2, 1000)
  }
}

cancelListing()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
