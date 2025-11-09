
const axios = require('axios1')
const endpoint = 'http://47.243.174.71:12801';
const gateway = 'http://47.243.174.71:17801'
const storage = {
  //调用ipfs接口上传图片
  async _imgUploadIpfs(fileData){
    const form = new FormData();
    form.append('file', fileData);
    let url = "https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"; // 默认图片
    try {
      await axios.post(endpoint + "/api/v0/add/", form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(response => {
        url = gateway +`/ipfs/${response.data.Hash}`;
      })
    }catch (e) {
      console.log(e)
    }
    return url;
  },
  // 从ipfs接口获取文件
  async getFileByCid(cid){
    if(!cid) return null
    return axios.get(gateway +'/ipfs/'+cid)
  },
  // 获取文件url
  getFileUrl(cid){
    return gateway + '/' + cid;
  }
}

module.exports = storage;
