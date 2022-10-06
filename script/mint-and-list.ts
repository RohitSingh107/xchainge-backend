import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"
import { storeNFT } from "../utils/uploadToNFTstorage"

const imageLocation = "./images/test/0008.jpg"
const productId = "11"
const PRICE = ethers.utils.parseEther("0.01")

async function mintAndList() {
  const token = await storeNFT(
    imageLocation,
    "My old product",
    productId,
    "My product is useful"
  )
  console.log(token)
  const { ipnft, url, data } = token

  // const xchainge: Xchainge = await ethers.getContract("Xchainge")

  const xchainge: Xchainge = await ethers.getContractAt("Xchainge", "0x2f19C27DE68b162989B1cA9A742CE493607C17C4")
  const xchaingeToken: XchaingeToken = await ethers.getContractAt("XchaingeToken", "0x204DA0Cb23ee397C8F4338EE1306d3F9D2d30063")

  console.log("Minting NFT...")
  const mintTx = await xchaingeToken.safeMint(
    data.properties.productId,
    url.toString()
  )
  const mintTxReceipt = await mintTx.wait(1)
  const tokenId = mintTxReceipt.events![0].args!.tokenId
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
