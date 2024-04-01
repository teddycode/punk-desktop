import request from '../util/request';

export const QueryCollectionListUsingGET = async (query: string) => {
  return request({
    url: '/collection/list/',
    method: 'GET',
  });
};
