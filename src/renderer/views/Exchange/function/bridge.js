const config = require("./config");
const {ethers} = require("ethers");
const {ethVault, wallet_side, erc20ShadowArtifact} = require("./bridge_setup")

async function deposit(chainId, token, amount, receiver) {
    // todo: chainId unused

    if (token === config.token.eth) {
        const input = ethers.utils.defaultAbiCoder.encode(["address"], [receiver]);
        const tx = await ethVault.deposit(input, {value: ethers.utils.parseEther(amount)});
        console.log(tx.hash)
    } else {
        console.log("")
    }

}

async function burn(chainId, token, amount, receiver) {
    // todo: chainId unused

    const ethShadow = new ethers.Contract(token, erc20ShadowArtifact.abi, wallet_side);
    await ethShadow.approve(token, ethers.utils.parseEther(amount));
    const tx = await ethShadow.burn(receiver, ethers.utils.parseEther(amount));
    console.log('Burning transaction sent:', tx.hash);
}

module.exports = {
    deposit,
    burn
};

// async function main(){
//     await deposit(1,config.token.eth,"1","0x643AC6aFeFdC7E9E66648262C67247e1166946f9")

// }
// main()