import Mock from 'mockjs'
import {collectionList, contractInfo} from "./mock";

// TODO fix
Mock.mock(`/collection/list`, 'GET', () => {
    let result = {}
    result.code = 200
    result.data = collectionList
    return result
})

Mock.mock(`/api/collection/contract/info`, 'GET', () => {
    let result = {}
    result.code = 200
    result.data = contractInfo
    return result
})
