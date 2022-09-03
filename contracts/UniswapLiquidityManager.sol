// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV2Router, IUniswapV2Pair, IUniswapV2Factory} from "./interfaces/Uniswap.sol";
import "hardhat/console.sol";

contract UniswapLiquidityManager {
    IUniswapV2Router router;
    IUniswapV2Factory factory;

    constructor(address _router, address _factory) {
        router = IUniswapV2Router(_router);
        factory = IUniswapV2Factory(_factory);
    }

    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint256 _amountA,
        uint256 _amountB
    ) external {
        IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);
        console.log("Transfered tokenA");
        IERC20(_tokenB).transferFrom(msg.sender, address(this), _amountB);
        console.log("Transfered tokenB");

        IERC20(_tokenA).approve(address(router), _amountA);
        IERC20(_tokenB).approve(address(router), _amountB);

        (uint amountA, uint amountB, uint liquidity) = router.addLiquidity(
            _tokenA,
            _tokenB,
            _amountA,
            _amountB,
            1,
            1,
            address(this),
            block.timestamp
        );

        console.log("liquidity provided of tokenA: %o", amountA);
        console.log("liquidity provided of tokenB: %o", amountB);
        console.log("liquidity tokens got: %o", liquidity);
    }

    function removeLiquidity(address _tokenA, address _tokenB) external {
        address pair = factory.getPair(_tokenA, _tokenB);

        uint256 liquidity = IERC20(pair).balanceOf(address(this));

        IERC20(pair).approve(address(router), liquidity);

        (uint256 tokenA, uint256 tokenB) = router.removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            1,
            1,
            address(this),
            block.timestamp
        );

        console.log("tokenA: %o", tokenA);
        console.log("tokenB: %o", tokenB);
    }
}
