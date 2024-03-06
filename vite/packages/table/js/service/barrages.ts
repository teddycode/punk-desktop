import { appStore } from '../../store';

export const barrages = {
  filteredBarrages: [],
  sendBarragesCount: [],
  /**
   * 通过计数的方式进行弹幕的屏蔽
   */
  filterBarrages(list) {
    barrages.filteredBarrages = JSON.parse(localStorage.getItem('filteredBarrages')) || [];
    barrages.sendBarragesCount = JSON.parse(localStorage.getItem('sendBarragesCount')) || {};
    let sendList = list.filter((barrage) => {
      if (barrages.filteredBarrages.indexOf(barrage.nanoid) > -1) {
        //已经被屏蔽了
        return false;
      }
      if (!barrages.sendBarragesCount[barrage.nanoid]) {
        barrages.sendBarragesCount[barrage.nanoid] = 1;
      } else {
        barrages.sendBarragesCount[barrage.nanoid]++;
      }
      if (barrages.sendBarragesCount[barrage.nanoid] > appStore().settings.barrage.repeat) {
        barrages.filteredBarrages.push(barrage.nanoid); //加入屏蔽列表
        delete barrages.sendBarragesCount[barrage.nanoid]; //移除屏蔽记录
        return false;
      }
      return true; //幸存下来的予以推送
    });
    localStorage.setItem('filteredBarrages', JSON.stringify(barrages.filteredBarrages));
    localStorage.setItem('sendBarragesCount', JSON.stringify(barrages.sendBarragesCount));
    //存入两个值
    return sendList;
  },

  send(data) {
    window.$manager.send(barrages.filterBarrages([data])); //进行前置过滤
    window.$manager.start();
  },
};
