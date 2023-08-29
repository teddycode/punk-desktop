import request from './request';

export const getMyBlock=(query) => {
    console.log('get my block');
    return request({
        url: '/consensus/myBlock.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getMyMicBlock=(query) => {
    console.log('get my micro block');
    return request({
        url: '/consensus/micBlock.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}
