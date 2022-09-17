import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"

const PRICE = ethers.utils.parseEther("0.1")

async function mintAndList() {
  const xchainge: Xchainge = await ethers.getContract("Xchainge")
  const randomNumber = Math.floor(Math.random() * 2)
  const xchaingeToken: XchaingeToken = await ethers.getContract("XchaingeToken")

  console.log("Minting NFT...")
  const mintTx = await xchaingeToken.safeMint("9", "This is uri")
  const mintTxReceipt = await mintTx.wait(1)
  const tokenId = mintTxReceipt.events[0].args.tokenId
  console.log("Approving NFT...")
  const approvalTx = await xchaingeToken.approve(xchainge.address, tokenId)
  await approvalTx.wait(1)
  console.log("Listing NFT...")
  const tx = await xchainge.listItem(xchaingeToken.address, tokenId, PRICE)
  await tx.wait(1)
  console.log(
    `NFT Listed! with tokenId id ${tokenId} at address ${xchaingeToken.address}`
  )
  if (network.config.chainId == 31337) {
    // Moralis has a hard time if you move more than 1 at once!
    await moveBlocks(1, 1000)
  }
}

mintAndList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
