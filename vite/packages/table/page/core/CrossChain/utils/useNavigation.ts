import { Router } from 'vue-router';  

export const goToBlock = (  
  router: Router,  
  blockHash: string,  
  multiAddr: string | undefined,  
  rpc: string | undefined  
) => {  
  if (!blockHash) {  
    console.error('Block hash is empty!');  
    return;  
  }  

  router.push({  
    path: `/multi/block/${blockHash}`,  
    state: { 
      multi_addr: multiAddr, 
      rpc: rpc 
    },  
  });  
};