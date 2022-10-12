import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"
import { storeNFT } from "../utils/uploadToNFTstorage"

import xchaingeAddressMumbai from "../broadcast/Xchainge.s.sol/80001/run-latest.json"
import xchaingeTokenAddressMumbai from "../broadcast/XchaingeToken.s.sol/80001/run-latest.json"

const imageLocation = "./images/test/0008.jpg"
const productId = "19"
// const PRICE = ethers.utils.parseEther("0.01")
const PRICE = "1"

async function mintAndList() {
  const token = await storeNFT(
    imageLocation,
    "My old product",
    productId,
    "My product is useful"
  )
  console.log(token)
  const { ipnft, url, data } = token

  const xchaingeAddress =
    xchaingeAddressMumbai["transactions"][0]["contractAddress"]
  const xchaingeTokenAddress =
    xchaingeTokenAddressMumbai["transactions"][0]["contractAddress"]

  const xchainge: Xchainge = await ethers.getContractAt(
    "Xchainge",
    xchaingeAddress
  )
  const xchaingeToken: XchaingeToken = await ethers.getContractAt(
    "XchaingeToken",
    xchaingeTokenAddress
  )

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
