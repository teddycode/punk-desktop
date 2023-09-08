// const env = process.env.DEPLOYMENT_ENV || 'development';

const tokens = {
    eth: '0x0000000000000000000000000000000000000000',
    ethShadow: '0xB7e399C05E86200Ec894d3E513748f9C6fe14A11'
}

const development = {
    abiPath: "./abi/",
    contracts: {
        frameworkOnMainChain: '0x48F4804809C781D9Ad108d0BF293CfbBF4fc4fc7',
        ethVaultOnMainChain: '0x64a305bd6b4788A3a834833D5cc2d28c407fa3F3',
        exitGameOnMainChain: '0xE822C935F845e5D30909Aa14848C165721A459C6',

        frameworkOnSideChain: '0x81e115AA4891DdE0aaBe906aEcFC5Ba7343a38DC',
        ethShadowOnSideChain: tokens.ethShadow,
        bridgeRouterOnSideChain: '0x74566A9A86c059ECe6556Cd93274830180858674',
    },
    token: tokens,
    tokenMappingFromShadow: {
        [tokens.ethShadow]: tokens.eth
    },
    shadowMappingFromToken: {
        [tokens.eth]: tokens.ethShadow
    },
    providers: {
        main: 'http://10.130.157.227:3400',
        side: 'http://10.130.157.227:3400',
    }
}

module.exports = development;
