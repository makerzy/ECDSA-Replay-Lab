import { ethers } from "hardhat";
import { FAMUERC20 } from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { getTime } from "./vulnerable.test";
import BigNumber from "bignumber.js";

let owner: SignerWithAddress, other0: SignerWithAddress, other1: SignerWithAddress, famu: FAMUERC20;

beforeEach("transaction", async () => {
  [owner, other0, other1] = await ethers.getSigners();
  const FAMU = await ethers.getContractFactory("FAMUERC20", owner);
  famu = await FAMU.deploy();
})
export const getDomain = (name: string, verifyingContract: string) => ({
  name,
  version: "1.0.1",
  chainId: 31337,
  verifyingContract,
})
async function makeSig(owner: SignerWithAddress, spender: SignerWithAddress, value: string, nonce: number, deadline: number) {
  const domain = getDomain('FAMU Token', famu.address)
  //  keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  }

  const _value = {
    owner: owner.address,
    spender: spender.address,
    value,
    nonce,
    deadline,
  }
  const signature = await owner._signTypedData(domain, types, _value)
  const { v, r, s } = ethers.utils.splitSignature(signature)
  return { ..._value, v, r, s }

}

describe("FAMUToken", function () {
  describe("Deploy", () => {
    it("deploy", async () => {
      const totalSupply = await famu.totalSupply()
      expect(totalSupply).to.be.gt(5000000)
      expect(await famu.balanceOf(owner.address)).to.equal(totalSupply)
    })
  })

  describe("Transaction", function () {
    it("Should approve with permit", async function () {
      const { deadline, value, spender, v, r, s } = await makeSig(owner, other0, BigNumber(5000).multipliedBy(1e18).toString(10), 1, getTime(6000))
      await famu.connect(other1).permit(owner.address, spender, value, deadline, v, r, s)
      expect(await famu.allowance(owner.address, spender)).to.equal(value)
      await expect(famu.connect(other0).transferFrom(owner.address, spender, value)).to.emit(famu, "Transfer")
    });



    it("Should fail if signature is replayed", async function () {
      const { deadline, value, spender, v, r, s } = await makeSig(owner, other0, BigNumber(5000).multipliedBy(1e18).toString(10), 1, getTime(6000))
      await famu.connect(other1).permit(owner.address, spender, value, deadline, v, r, s)
      await expect(famu.connect(other1).permit(owner.address, spender, value, deadline, v, r, s)).to.revertedWith('FamuERC20: INVALID_SIGNATURE')
      expect(await famu.allowance(owner.address, spender)).to.equal(BigNumber(value).toString(10))
      await expect(famu.connect(other0).transferFrom(owner.address, spender, value)).to.emit(famu, "Transfer")
      expect(await famu.allowance(owner.address, spender)).to.equal(0)
    });
  });
});
