import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionResponse } from "@ethersproject/providers";
import { main } from "../scripts/deploy";

const FACTORY: string = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
const ROUTER: string = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH_ADDRESS: string = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC_ADDRESS: string = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

describe("UniswapLiquidityManager", function () {

  let usdc: Contract;
  let uniswapRouter: Contract;
  let accounts: SignerWithAddress[];
  let WETH: Contract;
  let tx: TransactionResponse;
  let liquidityManager: Contract;
  let balanceUsdcAfter: BigNumber;

  before(async () => {
    usdc = await ethers.getContractAt('IERC20', USDC_ADDRESS)
    uniswapRouter = await ethers.getContractAt("IUniswapV2Router", ROUTER)
    accounts = await ethers.getSigners();
    WETH = await ethers.getContractAt("WMATIC", WETH_ADDRESS)
    liquidityManager = await ethers.getContractAt("UniswapLiquidityManager", await main());

    const amountIn = ethers.utils.parseUnits("10", "ether")
    console.log("Getting WETH for ETH deposits")
    await WETH.deposit({ value: amountIn })
    console.log("Got WETH: ", (await WETH.balanceOf(accounts[0].address)).toString())
    await WETH.approve(ROUTER, (await WETH.balanceOf(accounts[0].address)).toString());
    const amountsOut = await uniswapRouter.getAmountsOut(BigNumber.from((await WETH.balanceOf(accounts[0].address)).toString()).div(BigNumber.from(2)), [WETH_ADDRESS, USDC_ADDRESS]);
    const amountOutMin = BigNumber.from(amountsOut[1].toString())
      .mul(BigNumber.from(90))
      .div(BigNumber.from(100));
    const balanceUsdcBefore = await usdc.balanceOf(accounts[0].address);

    console.log("Swapping WETH for USDC_ADDRESS");
    const toSwapWeth = BigNumber.from((await WETH.balanceOf(accounts[0].address)).toString()).div(BigNumber.from(2));
    tx = await uniswapRouter.swapExactTokensForTokens(
      toSwapWeth,
      amountOutMin,
      [WETH_ADDRESS, USDC_ADDRESS],
      accounts[0].address,
      Math.floor((Date.now() / 1000)) + 60 * 10
    );
    console.log("amountIn: ", toSwapWeth.toString())

    await tx.wait();

    balanceUsdcAfter = BigNumber.from(await usdc.balanceOf(accounts[0].address));
    console.log("USDC Balance: ", balanceUsdcAfter.toString())
    const executionPerf = balanceUsdcAfter.sub(balanceUsdcBefore).div(amountsOut[1]);
    console.log("executionPerf by sushiswap: ", executionPerf.toString());

  })

  it("Should add and remove liquidity", async function () {
    console.log("WETH bal: ",(await WETH.balanceOf(accounts[0].address)).toString())
    tx = await WETH.approve(liquidityManager.address, await WETH.balanceOf(accounts[0].address));
    await tx.wait();
    console.log("WETH approved")
    tx = await usdc.approve(liquidityManager.address, await usdc.balanceOf(accounts[0].address));
    await tx.wait();
    console.log("USDC approved")

    tx = await liquidityManager.addLiquidity(
      WETH_ADDRESS,
      USDC_ADDRESS,
      ethers.utils.parseUnits("5", "ether"),
      await usdc.balanceOf(accounts[0].address)
    );
    await tx.wait()
    console.log("Liquidity added")

    tx = await liquidityManager.removeLiquidity(WETH_ADDRESS, USDC_ADDRESS);
    await tx.wait()
    console.log("Liquidity removed")

  });

});
