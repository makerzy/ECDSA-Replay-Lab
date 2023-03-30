import { ethers } from "hardhat";

async function main() {
  
  const FAMUToken = await ethers.getContractFactory("FAMUERC20");
  const FamuToken = await FAMUToken.deploy();
  await FamuToken.deployed();

  console.log(
    `The total supply of FAMUERC20 token is ${ethers.utils.formatEther(await FamuToken.totalSupply())} FAMUToken and deployed to ${FamuToken.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
