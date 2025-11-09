<template>
  <div>
    <input type="file" @change="testImgUploadIPFS" />
    <div v-if="imageUrl">
      <p>IPFS Image URL: {{ imageUrl }}</p>
      <img :src="imageUrl" alt="Uploaded Image" />
    </div>
    <a-button @click="clearDesk">清除桌面</a-button>
    <a-button @click="addDeskCards">添加小程序</a-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { create } from 'ipfs-http-client';
import {imgUpload} from "@js/service/socialNetwork_forum";
import {comStore} from "@store/com";
import {cardStore} from "@store/card";

const store = comStore();
//导入axios模块
import axios from "axios";

// 配置ipfs-http-client，连接到本地运行的IPFS桌面应用
// const client = create({ url: 'http://localhost:5001' });
const client = create({ host: '123.157.213.102', port: '39761', protocol: 'http'});
// const client = create({ host: 'localhost', port: '5001', protocol: 'http', apiPath: '/api/v0',});
const imageUrl = ref('http://47.243.174.71:17801/ipfs/QmWvwK3K443XH9Srr38Nh8r1RytpArwthCUgUna3zrG2MV');

const clearDesk = async () => {
  await cardStore().switchToDesk(3);
  cardStore().removeCards();
}
const addDeskCards = async () => {
  await cardStore().switchToDesk(3);
  let iconList = [];
  let newIcon = {};
  let id = 2;
  newIcon.titleValue = "节点管";
  newIcon.link = 'fast';
  newIcon.src = 'https://cryptofonts.com/img/icons/her.svg';
  newIcon.open = {
    type: 'Dapp',
    dappId: id
  };
  let random = Math.floor(Math.random() * 50) * Math.floor(Math.random() * 100);
  iconList.push({
    name: 'myIcons',
    id: Date.now() - random,
    type: 'Dapp',
    dappId: id,
    customData: { iconList: [newIcon] },
  });
  let desk = cardStore().getCurrentDesk();
  await cardStore().removeCards(desk);
  cardStore().addCards(iconList, desk)
}
//使用ipfs-http-client上传文件(有问题)
async function uploadToIPFS(event) {
  const file = event.target.files[0];
  console.log(file)
  if (!file) return;

  // imageUrl.value = await store._imgUpload(file)

  // const formData = new FormData();
  // formData.append('file',file);
  // console.log(formData)
  // try {
  //   await imgUpload(formData).then(response => {
  //     console.log(response);
  //     imageUrl.value = response.data
  //   })
  // } catch (error){
  //   console.error('Error uploading file:', error)
  // }




  try {
    const added = await client.add(file);
    console.log('added', added);
    console.log(added.cid.toString())
    // imageUrl.value = `http://localhost:8080/ipfs/${added.path}`;
    imageUrl.value = `http://123.157.213.102:39760/ipfs/${added.cid.toString()}`;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
//使用axios直接调用ipfs接口上传文件
const axiosClient = async (event) => {
  try {

    const form = new FormData();
    form.append('file', event.target.files[0])
    await axios.post("http://123.157.213.102:39761/api/v0/add/", form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    }).then(response => {
      console.log(response.data.Hash)
      imageUrl.value = `http://123.157.213.102:39760/ipfs/${response.data.Hash}`;
    })
  }catch (e) {
    console.log(e)
  }
}
const testImgUploadIPFS = async (event) => {
  // store._imgUploadIpfs(event.target.files[0]);
  console.log(tsbApi.util.friendlyDate(new Date().getTime()))
  // imageUrl.value = await punkosApi.storage._imgUploadIpfs(event.target.files[0]);
    imageUrl.value = await tsbApi.punkos.storage._imgUploadIpfs(event.target.files[0]);
}
</script>
