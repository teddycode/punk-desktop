// @ts-ignore
import {hook, wallet} from "./address";

async function withdrawLimitOrder(epoch, to) {
  let tx = await hook.withdraw(epoch, to);
  await tx.wait();
  console.log("limit order withdraw successfully");
  await hook.once("Withdraw", (owner, epoch, liquidity, event) => {
    console.log("Withdraw event emitted:");
    console.log("Owner: ", owner);
    console.log("Epoch: ", epoch.toString());
    console.log("Liquidity: ", liquidity.toString());
  });
}

export async function withdraw_main(epoch) {
  // let epoch = 6
  let to = wallet.address
  await withdrawLimitOrder(epoch, to);
}
