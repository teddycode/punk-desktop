<template>
  <div ref="trend" style="width: 60px;height: 40px"></div>
</template>
<script>
import {defineComponent} from 'vue'
import * as echarts from "echarts";

export default defineComponent({
  name: "TrendChart",
  props:['tagData'],
  data() {
    return {
      myChart: null
    }
  },
  mounted() {
    this.initChart();
  },
  watch: {
    tagData: {
      handler(newval){
        if(this.myChart){
          this.myChart.setOption({
            series: {
              data: this.tagData,
            },
          })
        }
      }
    }
  },
  methods: {
    initChart(){
      var myChart = echarts.init(this.$refs.trend);
      this.myChart = myChart;
      myChart.setOption({
        xAxis: {
          type: 'category',
          axisLabel: {
            //坐标轴刻度标签
            show: false
          },
          axisLine: {
            //坐标轴轴线
            show: false
          },
          axisTick: {
            //坐标轴刻度
            show: false
          }
        },
        yAxis: {
          type:'value',
          splitLine: {
            //坐标轴在grid区域中的分割线
            show: false
          },
          axisLabel: {
            //坐标轴刻度标签
            show: false
          },
          scale:true
        },
        grid: {
          top: 1,
          right: 1,
          bottom: 1,
          left: 1
        },
        series: [
          {
            data: this.tagData,
            type: 'line',
            smooth: true,
            symbol: 'none', //标记的图形，去掉默认的小圆点标识
            lineStyle: {
              //线条颜色
              color: '#00f',
              width: 1 // 设置线条的粗细为5
            },
            areaStyle: {
              color: '#00f',
              opacity: 0.2
            }
          }
        ]
      });
      // 大小自适应窗口大小变化
      window.onresize = function () {
        // 重置容器高宽
        myChart.resize();
      };
    }
  }
})
</script>

<style scoped lang="scss">

</style>
