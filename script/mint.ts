import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { XchaingeToken } from "../typechain-types"
import { storeNFT } from "../utils/uploadToNFTstorage"

import xchaingeAddressMumbai from "../broadcast/Xchainge.s.sol/80001/run-latest.json"
import xchaingeTokenAddressMumbai from "../broadcast/XchaingeToken.s.sol/80001/run-latest.json"

const imageLocation = "./images/test/0008.jpg"
const productId = "11"

async function mint() {
  const token = await storeNFT(
    imageLocation,
    "My old product",
    productId,
    "My product is useful"
  )
  console.log(token)
  const { ipnft, url, data } = token

  // const xchaingeToken: XchaingeToken = await ethers.getContract("XchaingeToken")

  const xchaingeTokenAddress = xchaingeTokenAddressMumbai["transactions"][0]["contractAddress"]
  const xchaingeToken: XchaingeToken = await ethers.getContractAt("XchaingeToken", xchaingeTokenAddress)

  console.log("Minting NFT...")
  const mintTx = await xchaingeToken.safeMint(
    data.properties.productId,
    url.toString()
  )
  const mintTxReceipt = await mintTx.wait(1)
  console.log(
    `Minted tokenId ${mintTxReceipt.events[0].args.tokenId.toString()} from contract: ${
      xchaingeToken.address
    }`
  )
  if (network.config.chainId == 31337) {
    // Moralis has a hard time if you move more than 1 block!
    await moveBlocks(2, 1000)
  }
}

mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
