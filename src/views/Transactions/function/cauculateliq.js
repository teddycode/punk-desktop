// @ts-ignore
// import { ethers } from "hardhat";

// const two96 = ethers.BigNumber.from("2").pow(96);
// const x96 = 2 ** 96;
// eslint-disable-next-line no-undef
const q96 = BigInt(2) ** BigInt(96);

export function calculateTickFromPriceWithSpacing(price, tickSpacing=60){
    let unroundedTick = Math.floor(Math.log(price) / Math.log(1.0001));
    return Math.round(unroundedTick / tickSpacing) * tickSpacing;
}
export function calculateTickFromPrice(price){
    let unroundedTick = Math.floor(Math.log(price) / Math.log(1.0001));
    return Math.round(unroundedTick);
}

export function calculatePriceFromTick(tick){
    return Math.exp(tick * Math.log(1.0001));
}

export function priceToSqrtPrice(price){
    // eslint-disable-next-line no-undef
    return BigInt(Math.floor(Math.sqrt(price) * Number(q96)));
}

// function sqrtPricetoPrice(sqrtprice) {
//     return sqrtprice.mul(sqrtprice).div(two96).div(two96);
// }
//
// function pricetoSqrtPrice(price) {
//     let sqrtPrice = Math.sqrt(price);
//     let sqrtPriceX96 = ethers.Bignumber.from((sqrtPrice * x96).toString());
//     return sqrtPriceX96;
// }

function liquidity0(amount, pa, pb){
    if (pa > pb) {
        [pa, pb] = [pb, pa];
    }
    // eslint-disable-next-line no-undef
    return BigInt(amount) * pa * pb / q96 / (pb - pa);
}

function liquidity1(amount, pa, pb){
    if (pa > pb) {
        [pa, pb] = [pb, pa];
    }
    // eslint-disable-next-line no-undef
    return BigInt(amount) * q96 / (pb - pa);
}

export function caculateLiqDetla(pricelow,pricecur,priceupp,amount0,amount1)
{
    let sqrt_low = priceToSqrtPrice(pricelow);
    let sqrt_cur = priceToSqrtPrice(pricecur);
    let sqrt_upp = priceToSqrtPrice(priceupp);
    let liq0 = liquidity0(amount0, sqrt_cur, sqrt_upp);
    let liq1 = liquidity1(amount1, sqrt_cur, sqrt_low);
    let liq = liq0 < liq1 ? liq0 : liq1;
    console.log(liq.toString());
    return liq;
}
export function caculateLiqDetla2(pricelow,pricecur,priceupp,amount0,amount1)
{
    let sqrt_low = priceToSqrtPrice(pricelow);
    let sqrt_cur = priceToSqrtPrice(pricecur);
    let sqrt_upp = priceToSqrtPrice(priceupp);
    let liq0 = liquidity0(amount0, sqrt_cur, sqrt_upp);
    let liq1 = liquidity1(amount1, sqrt_cur, sqrt_low);
    let liq = liq0 < liq1 ? liq1 : liq0;
    console.log(liq.toString());
    return liq;
}
function main(){
    //console.log(caculateLiqDetla(100,110,120,100,100).toString);
}

main();
