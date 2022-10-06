import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"

const TOKEN_ID = 9

async function buyToken() {
  // const xchainge: Xchainge = await ethers.getContract("Xchainge")
  // const xchaingeToken: XchaingeToken = await ethers.getContract("XchaingeToken")

  const xchainge: Xchainge = await ethers.getContractAt("Xchainge", "0x2f19C27DE68b162989B1cA9A742CE493607C17C4")
  const xchaingeToken: XchaingeToken = await ethers.getContractAt("XchaingeToken", "0x204DA0Cb23ee397C8F4338EE1306d3F9D2d30063")

  console.log(xchainge)

  const listing = await xchainge.getListing(xchaingeToken.address, TOKEN_ID)
  console.log(listing)
  const price = listing.price.toString()
  console.log(
    `address is ${xchaingeToken.address}, token id is ${TOKEN_ID}, price is ${price}`
  )

  const tx = await xchainge.buyItem(xchaingeToken.address, TOKEN_ID, {
    value: price,
  })
  const txReceipt = await tx.wait(1)

  const tokenId = txReceipt.events![1].args!.tokenId
  console.log(`NFT of tokenId ${tokenId} Bought!`)
  if (network.config.chainId!.toString() == "31337") {
    await moveBlocks(2, 1000)
  }
}

buyToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
