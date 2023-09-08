import request from '@/utils/request';

export const getAllBlock=(query) => {
    console.log('get all block');
    return request({
        url: '/mock/consensus/block.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getBlockByHeight=(query) => {
    console.log('get a block by height');
    return request({
        url: '/mock/consensus/block.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getBlockByHash=(query) => {
    console.log('get a block by hash');
    return request({
        url: '/mock/consensus/block.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getMicBlockByHeight=(query) => {
    console.log('get a micro block by height');
    return request({
        url: '/mock/consensus/micBlock.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getMicBlockByHash=(query) => {
    console.log('get a micro block by hash');
    return request({
        url: '/mock/consensus/block.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getMyBlock=(query) => {
    console.log('get my block');
    return request({
        url: '/mock/consensus/myBlock.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getMyMicBlock=(query) => {
    console.log('get my micro block');
    return request({
        url: '/mock//consensus/micBlock.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}



