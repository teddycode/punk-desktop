import request from '../util/request';

export const QueryCoinPriceUsingGET = async (query: string) => {
    return await request({
        url: '/exchange/others/market/' + query,
        method: 'GET',
    })
}

