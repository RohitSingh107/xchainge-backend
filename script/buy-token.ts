import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"

const TOKEN_ID = 9

async function buyToken() {
  const xchainge: Xchainge = await ethers.getContract("Xchainge")
  const xchaingeToken: XchaingeToken = await ethers.getContract("XchaingeToken")
  const listing = await xchainge.getListing(xchaingeToken.address, TOKEN_ID)
  const price = listing.price.toString()
  console.log(
    `address is ${xchaingeToken.address}, token id is ${TOKEN_ID}, price is ${price}`
  )

  const tx = await xchainge.buyItem(xchaingeToken.address, TOKEN_ID, {
    value: price,
  })
  const txReceipt = await tx.wait(1)

  const tokenId = txReceipt.events[1].args.tokenId
  console.log(`NFT of tokenId ${tokenId} Bought!`)
  if (network.config.chainId.toString() == "31337") {
    await moveBlocks(2, 1000)
  }
}

buyToken()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
