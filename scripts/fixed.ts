import  BigNumber  from 'bignumber.js';
import { getSigners, getDomain, getTime } from './utils';
import { Wallet, utils } from 'ethers';

let owner: Wallet, other0: Wallet, other1: Wallet;

async function makeSig(owner: Wallet, spender: Wallet, value: string, deadline: number) {
  const domain = getDomain('Vulnerable Token', process.env.VULNERABLE_ADDRESS as string)
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
    nonce: 1,
    deadline,
  }

  const signature = await owner._signTypedData(domain, types, _value)
  const { v, r, s } = utils.splitSignature(signature)
  return { ..._value, v, r, s }
}

async function main() {
  [owner, other0, other1] = getSigners();
  const value = BigNumber(50000).times(1e18).toString(10)
  const calldata = await makeSig(owner, other0, value, getTime(50000))
  console.log(calldata)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
