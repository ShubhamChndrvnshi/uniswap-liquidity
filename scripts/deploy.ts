import { ethers } from "hardhat";
import {} from "ethers"

async function main() {

  const FACTORY: string = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
  const ROUTER: string = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const WETH: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";


  const UniswapLiquidityManager = await ethers.getContractFactory("UniswapLiquidityManager");
  const uniswapLiquidityManager = await UniswapLiquidityManager.deploy(ROUTER, FACTORY);

  await uniswapLiquidityManager.deployed();

  console.log(`UniswapLiquidityManager deployed to ${uniswapLiquidityManager.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}
