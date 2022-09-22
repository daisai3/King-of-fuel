const { ethers } = require("hardhat");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("KingOfTheFules contract test", () => {
  // accounts
  let deployer, account1, account2, account3;
  let kingOfTheFules;
  let stakingToken;

  before(async () => {
    [deployer, account1, account2, account3] = await ethers.getSigners();

    // prepare staking token
    const StakingToken = await ethers.getContractFactory("MockERC20");
    stakingToken = await StakingToken.deploy(
      "Mock Staking Token1",
      "mST1",
      utils.parseUnits("1000000")
    );
    await stakingToken.deployed();
    console.log(`staking token was deployed to ${stakingToken.address}`);

    // prepare KingOfTheFules contract
    const kingOfTheFulesContract = await ethers.getContractFactory(
      "KingOfTheFules"
    );
    kingOfTheFules = await kingOfTheFulesContract.deploy(stakingToken.address);

    await kingOfTheFules.deployed();
    console.log("kingOfTheFules deployed to: " + kingOfTheFules.address);

    // mint staking token to account1, account2, account3
    await stakingToken.connect(account1).mint(utils.parseUnits("10000"));
    await stakingToken.connect(account2).mint(utils.parseUnits("10000"));
    await stakingToken.connect(account3).mint(utils.parseUnits("10000"));
  });

  describe("stealCrown function test", () => {
    it("(1)should be failed when amount is 0", async () => {
      await expect(
        kingOfTheFules.connect(account1).stealCrown(utils.parseUnits("0"))
      ).to.be.revertedWith("Amount can't be 0!");
    });

    it("(2)should be succeeded when current king is empty", async () => {
      await stakingToken
        .connect(account1)
        .approve(kingOfTheFules.address, utils.parseUnits("10"));

      await expect(
        kingOfTheFules.connect(account1).stealCrown(utils.parseUnits("10"))
      )
        .to.emit(kingOfTheFules, "KingChanged")
        .withArgs(account1.address, ethers.constants.AddressZero);

      const [account, amount] = await kingOfTheFules.getCurrentKing();
      expect(account).to.be.equal(account1.address);
      expect(amount).to.be.equal(utils.parseUnits("10"));
    });

    it("(3)should be failed when allowance is insufficient", async () => {
      const amount = await kingOfTheFules.getMinAmounToStealCrown();
      await expect(
        kingOfTheFules.connect(account2).stealCrown(amount)
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("(4)should be succeeded and transfer token from current king to prev king", async () => {
      // token balance before
      const [prevKing] = await kingOfTheFules.getCurrentKing();
      const prevKingTokenBalBefore = await stakingToken.balanceOf(prevKing);
      const currentKingTokenBalBefore = await stakingToken.balanceOf(
        account2.address
      );

      const amount = await kingOfTheFules.getMinAmounToStealCrown();
      await stakingToken
        .connect(account2)
        .approve(kingOfTheFules.address, amount);

      await kingOfTheFules.connect(account2).stealCrown(amount);

      // token balance after
      const prevKingTokenBalAfter = await stakingToken.balanceOf(prevKing);
      const currentKingTokenBalAfter = await stakingToken.balanceOf(
        account2.address
      );

      // token balance compare
      expect(prevKingTokenBalAfter).to.be.equal(
        prevKingTokenBalBefore.add(amount)
      );
      expect(currentKingTokenBalAfter).to.be.equal(
        currentKingTokenBalBefore.sub(amount)
      );
    });

    it("(5)should be failed when sender is the current king", async () => {
      const amount = await kingOfTheFules.getMinAmounToStealCrown();
      await stakingToken
        .connect(account2)
        .approve(kingOfTheFules.address, amount);

      await expect(
        kingOfTheFules.connect(account2).stealCrown(amount)
      ).to.be.revertedWith("Sender is current king!");
    });

    it("(6)should be failed when the amount is not enough", async () => {
      const amount = await kingOfTheFules.getMinAmounToStealCrown();
      await stakingToken
        .connect(account3)
        .approve(kingOfTheFules.address, amount.div(2));

      await expect(
        kingOfTheFules.connect(account3).stealCrown(amount.div(2))
      ).to.be.revertedWith("Not enough amount!");
    });
  });
});
