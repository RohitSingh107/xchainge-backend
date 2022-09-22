import { assert, expect } from "chai"
import { Signer } from "ethers"
import { network, deployments, ethers } from "hardhat"
import { Xchainge, XchaingeToken } from "../../typechain-types"

const developmentChains = ["hardhat", "localhost"]
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", function () {
      let xchainge: Xchainge,
        xchaingeContract: Xchainge,
        xchaingeToken: XchaingeToken
      const PRICE = ethers.utils.parseEther("0.1")
      const TOKEN_ID = 0
      const URI = "this is a uri"
      let deployer: Signer
      let user: Signer

      beforeEach(async () => {
        const accounts = await ethers.getSigners() // could also do with getNamedAccounts
        deployer = accounts[0]
        user = accounts[1]
        await deployments.fixture(["all"])
        xchaingeContract = await ethers.getContract("Xchainge")
        xchainge = xchaingeContract.connect(deployer)
        xchaingeToken = await ethers.getContract("XchaingeToken", deployer)
        await xchaingeToken.safeMint(TOKEN_ID, URI)
        await xchaingeToken.approve(xchaingeContract.address, TOKEN_ID)
      })

      describe("listItem", function () {
        // it("emits an event after listing an item", async function () {
        //   expect(
        //     await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
        //   ).to.emit(xchainge, "ItemListed")
        // })
        it("exclusively items that haven't been listed", async function () {
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          const error = `Xchainge__AlreadyListed("${xchaingeToken.address}", ${TOKEN_ID})`

          expect(
            xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith(error)
        })
        it("exclusively allows owners to list", async function () {
          xchainge = xchaingeContract.connect(user)
          await xchaingeToken.approve(await user.getAddress(), TOKEN_ID)
          expect(
            xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("Xchainge__NotOwner")
        })
        it("needs approvals to list item", async function () {
          await xchaingeToken.approve(ethers.constants.AddressZero, TOKEN_ID)
          expect(
            xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("Xchainge__NotApprovedForMarketplace")
        })
        it("Updates listing with seller and price", async function () {
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          const listing = await xchainge.getListing(
            xchaingeToken.address,
            TOKEN_ID
          )
          assert(listing.price.toString() == PRICE.toString())
          assert(listing.seller.toString() == (await deployer.getAddress()))
        })
      })
      describe("cancelListing", function () {
        it("reverts if there is no listing", async function () {
          const error = `Xchainge__NotListed("${xchaingeToken.address}", ${TOKEN_ID})`
          expect(
            xchainge.cancelListing(xchaingeToken.address, TOKEN_ID)
          ).to.be.revertedWith(error)
        })
        it("reverts if anyone but the owner tries to call", async function () {
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          xchainge = xchaingeContract.connect(user)
          await xchaingeToken.approve(await user.getAddress(), TOKEN_ID)
          expect(
            xchainge.cancelListing(xchaingeToken.address, TOKEN_ID)
          ).to.be.revertedWith("Xchainge__NotOwner")
        })
        it("emits event and removes listing", async function () {
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          expect(
            await xchainge.cancelListing(xchaingeToken.address, TOKEN_ID)
          ).to.emit(xchainge, "ItemCanceled")
          const listing = await xchainge.getListing(
            xchaingeToken.address,
            TOKEN_ID
          )
          assert(listing.price.toString() == "0")
        })
      })
      describe("buyItem", function () {
        it("reverts if the item isnt listed", async function () {
          expect(
            xchainge.buyItem(xchaingeToken.address, TOKEN_ID)
          ).to.be.revertedWith("Xchainge__NotListed")
        })
        it("reverts if the price isnt met", async function () {
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          expect(
            xchainge.buyItem(xchaingeToken.address, TOKEN_ID)
          ).to.be.revertedWith("Xchainge__PriceNotMet")
        })
        it("transfers the nft to the buyer and updates internal proceeds record", async function () {
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          xchainge = xchaingeContract.connect(user)
          expect(
            await xchainge.buyItem(xchaingeToken.address, TOKEN_ID, {
              value: PRICE,
            })
          ).to.emit(xchainge, "ItemBought")
          const newOwner = await xchaingeToken.ownerOf(TOKEN_ID)
          const deployerProceeds = await xchainge.getProceeds(
            await deployer.getAddress()
          )
          assert(newOwner.toString() == (await user.getAddress()))
          assert(deployerProceeds.toString() == PRICE.toString())
        })
      })
      describe("updateListing", function () {
        it("must be owner and listed", async function () {
          expect(
            xchainge.updateListing(xchaingeToken.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("Xchainge__NotListed")
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          xchainge = xchaingeContract.connect(user)
          expect(
            xchainge.updateListing(xchaingeToken.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("Xchainge__NotOwner")
        })
        it("updates the price of the item", async function () {
          const updatedPrice = ethers.utils.parseEther("0.2")
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          expect(
            await xchainge.updateListing(
              xchaingeToken.address,
              TOKEN_ID,
              updatedPrice
            )
          ).to.emit(xchainge, "ItemListed")
          const listing = await xchainge.getListing(
            xchaingeToken.address,
            TOKEN_ID
          )
          assert(listing.price.toString() == updatedPrice.toString())
        })
      })
      describe("withdrawProceeds", function () {
        it("doesn't allow 0 proceed withdrawls", async function () {
          expect(xchainge.withdrawProceeds()).to.be.revertedWith(
            "Xchainge__NoProceeds"
          )
        })
        it("withdraws proceeds", async function () {
          await xchainge.listItem(xchaingeToken.address, TOKEN_ID, PRICE)
          xchainge = xchaingeContract.connect(user)
          await xchainge.buyItem(xchaingeToken.address, TOKEN_ID, {
            value: PRICE,
          })
          xchainge = xchaingeContract.connect(deployer)

          const deployerProceedsBefore = await xchainge.getProceeds(
            await deployer.getAddress()
          )
          const deployerBalanceBefore = await deployer.getBalance()
          const txResponse = await xchainge.withdrawProceeds()
          const transactionReceipt = await txResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const deployerBalanceAfter = await deployer.getBalance()

          assert(
            deployerBalanceAfter.add(gasCost).toString() ==
              deployerProceedsBefore.add(deployerBalanceBefore).toString()
          )
        })
      })
    })
