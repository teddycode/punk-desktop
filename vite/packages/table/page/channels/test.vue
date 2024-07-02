<template>
  <div>
    <input type="file" @change="uploadToIPFS" />
    <div v-if="imageUrl">
      <p>IPFS Image URL: {{ imageUrl }}</p>
      <img :src="imageUrl" alt="Uploaded Image" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { create } from 'ipfs-http-client';
import {imgUpload} from "@js/service/socialNetwork_forum";
import {comStore} from "@store/com";
const store = comStore()

// 配置ipfs-http-client，连接到本地运行的IPFS桌面应用
// const client = create({ url: 'http://localhost:5001' });
const client = create({ host: '123.157.213.102', port: '39761', protocol: 'http'});
const imageUrl = ref('http://localhost:8080/ipfs/QmUNJWh6fDRPgShykhyPkjQBtaRMizX579NS6Qp7jguYPo');

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
    // imageUrl.value = `http://localhost:8080/ipfs/${added.path}`;
    imageUrl.value = `http://123.157.213.102:39760/ipfs/${added.path}`;
    console.log('Added file:', added.path);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
</script>
