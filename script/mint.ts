import { network, ethers } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import { XchaingeToken } from "../typechain-types";

const PRICE = ethers.utils.parseEther("0.1");

async function mint() {
  const xchaingeToken: XchaingeToken = await ethers.getContract(
    "XchaingeToken"
  );
  console.log("Minting NFT...");
  const mintTx = await xchaingeToken.safeMint("2", "This is token uri");
  const mintTxReceipt = await mintTx.wait(1);
  console.log(
    `Minted tokenId ${mintTxReceipt.events[0].args.tokenId.toString()} from contract: ${
      xchaingeToken.address
    }`
  );
  if (network.config.chainId == 31337) {
    // Moralis has a hard time if you move more than 1 block!
    await moveBlocks(2, 1000);
  }
}

mint()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

