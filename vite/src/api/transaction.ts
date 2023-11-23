import request from '../util/request';

export const TranslateUsingGET = async (from: string, to: string, text: string) => {
  return await request({
    url: '/translate/',
    method: 'GET',
    params: {
      from,
      to,
      text
    }
  })
}

