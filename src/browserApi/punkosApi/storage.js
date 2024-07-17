
const axios = require('axios1')
const storage = {
  //调用ipfs接口上传图片
  async _imgUploadIpfs(fileData){
    const form = new FormData();
    form.append('file', fileData);
    let url = "https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png";
    try {
      await axios.post("http://123.157.213.102:39761/api/v0/add/", form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }).then(response => {
        url = `http://123.157.213.102:39760/ipfs/${response.data.Hash}`;
      })
    }catch (e) {
      console.log(e)
    }
    return url;
  },
}

module.exports = storage;
