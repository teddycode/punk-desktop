import request from "@renderer/utils/request";

export const QueryCollectionListUsingGET = async (query: string) => {
    return await request({
        url: '/collection/list/',
        method: 'GET',
    })
}
