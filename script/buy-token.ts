import { network, ethers } from "hardhat"
import { moveBlocks } from "../utils/move-blocks"
import { Xchainge, XchaingeToken } from "../typechain-types"

import xchaingeAddressMumbai from "../broadcast/Xchainge.s.sol/80001/run-latest.json"
import xchaingeTokenAddressMumbai from "../broadcast/XchaingeToken.s.sol/80001/run-latest.json"


const TOKEN_ID = 17

async function buyToken() {
  // const xchainge: Xchainge = await ethers.getContract("Xchainge")
  // const xchaingeToken: XchaingeToken = await ethers.getContract("XchaingeToken")


  const xchaingeAddress = xchaingeAddressMumbai["transactions"][0]["contractAddress"]
  const xchaingeTokenAddress = xchaingeTokenAddressMumbai["transactions"][0]["contractAddress"]

  const xchainge: Xchainge = await ethers.getContractAt("Xchainge", xchaingeAddress)
  const xchaingeToken: XchaingeToken = await ethers.getContractAt("XchaingeToken", xchaingeTokenAddress)

  console.log(`xchainge address: ${xchainge.address}`)
  console.log(`xchaingeToken address: ${xchaingeToken.address}`)

  const listing = await xchainge.getListing(xchaingeToken.address, TOKEN_ID)
  // console.log(listing)
  const price = listing.price.toString()
  console.log(
    `address is ${xchaingeToken.address}, token id is ${TOKEN_ID}, price is ${price}`
  )

  const tx = await xchainge.buyItem(xchaingeToken.address, TOKEN_ID, {
    value: price,
  })
  console.log("tx----------------------------")
  console.log(tx)
  console.log("tx----------------------------")
  const txReceipt = await tx.wait(1)
  
  console.log("receipt----------------------------")
  console.log(txReceipt)
  console.log("receipt----------------------------")
  const tokenId = txReceipt.events![2].args!.tokenId

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
