import { expect } from "chai";
import { ethers } from "hardhat";
import { VulnerableERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getDomain } from "./famu.test";
import BigNumber from 'bignumber.js'

export const getTime = (time: number) => Math.floor(new Date().getTime() / 1000.0) + time;
let owner: SignerWithAddress, other0: SignerWithAddress, other1: SignerWithAddress, vulnerable: VulnerableERC20;

beforeEach("transaction", async () => {
  [owner, other0, other1] = await ethers.getSigners();
  const Vulnerable = await ethers.getContractFactory("VulnerableERC20", owner);
  vulnerable = await Vulnerable.deploy();
})
// keccak256("Permit(address owner,address spender,uint256 value,uint256 deadline)");
async function makeSig(owner: SignerWithAddress, spender: SignerWithAddress, value: string, deadline: number) {
  const domain = getDomain('Vulnerable Token', vulnerable.address)
  //  keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  }
  const _value = {
    owner: owner.address,
    spender: spender.address,
    value,
    deadline,
  }
  const signature = await owner._signTypedData(domain, types, _value)
  const { v, r, s } = ethers.utils.splitSignature(signature)
  return { ..._value, v, r, s }
}
describe("Vulnerable Token", function () {
  describe("Deploy", () => {
    it("deploy", async () => {
      const totalSupply = await vulnerable.totalSupply()
      expect(totalSupply).to.be.gt(5000000)
      expect(await vulnerable.balanceOf(owner.address)).to.equal(totalSupply)
    })
  })

  describe("Transaction", function () {
    it("Should approve with permit", async function () {
      const { deadline, value, spender, v, r, s } = await makeSig(owner, other0, BigNumber(5000).multipliedBy(1e18).toString(10), getTime(6000))
      await vulnerable.connect(other1).permit(owner.address, spender, value, deadline, v, r, s)
      expect(await vulnerable.allowance(owner.address, spender)).to.equal(value)
      await expect(vulnerable.connect(other0).transferFrom(owner.address, spender, value)).to.emit(vulnerable, "Transfer")
      expect(await vulnerable.allowance(owner.address, spender)).to.equal(0)
    });

    it("Should pass if signature is replayed", async function () {
      const { deadline, value, spender, v, r, s } = await makeSig(owner, other0, BigNumber(5000).multipliedBy(1e18).toString(10), getTime(6000))
      await expect(vulnerable.connect(other1).permit(owner.address, spender, value, deadline, v, r, s)).to.emit(vulnerable, 'Approval')
      expect(await vulnerable.allowance(owner.address, spender)).to.equal(BigNumber(value).toString(10))
      await expect(vulnerable.connect(other0).transferFrom(owner.address, spender, value)).to.emit(vulnerable, "Transfer")
      // replay signature
      await expect(vulnerable.connect(other1).permit(owner.address, spender, value, deadline, v, r, s)).to.emit(vulnerable, 'Approval')
      expect(await vulnerable.allowance(owner.address, spender)).to.equal(BigNumber(value).toString(10))
      await expect(vulnerable.connect(other0).transferFrom(owner.address, spender, value)).to.emit(vulnerable, "Transfer")
      expect(await vulnerable.allowance(owner.address, spender)).to.equal(0)
    });
  });
});
