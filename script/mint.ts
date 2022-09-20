import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { XchaingeToken } from "../typechain-types"
import { storeNFT } from "../utils/uploadToNFTstorage"

const TOKEN_ID = "13"
const imageLocation = "./images/test/wall.jpg"

async function mint() {
  const token = await storeNFT(
    imageLocation,
    "My old product",
    "1001",
    "My product is useful"
  )
  console.log(token)
  const { ipnft, url } = token

  const xchaingeToken: XchaingeToken = await ethers.getContract("XchaingeToken")
  console.log("Minting NFT...")
  const mintTx = await xchaingeToken.safeMint(TOKEN_ID, url.toString())
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
