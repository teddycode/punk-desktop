import request from '../../utils/request';

export const getAllBlock=(query) => {
    console.log('get all block');
    return request({
        url: '/consensus/block.json',
        // url: '/list',
        method: 'get',
        params: query,
    })
}

export const getBlockByHeight=(query) => {
    console.log('get a block by height');
    return request({
        url: '/consensus/block.json',
        // url: '/list',
        method: 'post',
        params: query,
    })
}

export const getBlockByHash=(query) => {
    console.log('get a block by hash');
    return request({
        url: '/consensus/block.json',
        // url: '/list',
        method: 'post',
        params: query,
    })
}

export const getMicBlockByHeight=(query) => {
    console.log('get a micro block by height');
    return request({
        url: '/consensus/micBlock.json',
        // url: '/list',
        method: 'post',
        params: query,
    })
}

export const getMicBlockByHash=(query) => {
    console.log('get a micro block by hash');
    return request({
        url: '/consensus/block.json',
        // url: '/list',
        method: 'post',
        params: query,
    })
}


