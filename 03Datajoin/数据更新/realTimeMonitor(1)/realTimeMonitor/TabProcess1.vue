<template>
  
  <div class="monitor-container">
    <div
    :id="`echarts-${id}`"
    v-loading="loading"
    element-loading-text="Loading..."
    element-loading-background="rgba(255, 255, 255, 0.5)"
    ></div>
  </div>  
</template> 
<script>  
// import {getFurnaceTemp} from "@/api/monitor"
import language from "@/locale/lang"
import * as echarts from "echarts"
import { resizeEchart } from "@/utils/echarts"


const allCharts = []
const allBoxes = [] 
    
const updateChartSize = () => {
  resizeEchart(allBoxes, allCharts)
}     
export default {
//   props: ["id","furnace","select","keyValue"],  
  props:{
    id:{
      type:Number
    },
    furnace:{
      type:Array
    },
    selTime:{
      type:Number
    }, 
    dataList:{
      type:Object
    },

     //   dataList:{
     //     type:Object
     //   },
     //   dataList1:{
     //     type:Object
     //   }  
  },
  
  components: {},
  data() {  
    // const startTime = new Date();
    // const endTime = new Date(startTime); 
    // startTime.setDate(startTime.getHours() - 40);
    // startTime.setHours(startTime.getHours(0,0,0,0) - 30 * 24);
    // endTime.setHours(endTime.getHours(23,59,59,59) + 24);
    // const startTime = new Date(new Date().setHours(0,0,0,0) - 24*30*60*60*1000)
    // const endTime = new Date(new Date().setHours(23,59,59,59)) 
    const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000); 
    const now = "" 
    // const startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()) 
    const startTime = null;   
    const endTime = null 
    const currentTime = new Date();
        // 获取前一个小时的时间
    const oneHourAgos = new Date(currentTime);
    oneHourAgos.setHours(oneHourAgo.getHours() - 1);
            
    return {
      queryParams: {  
        startTime:"",
        createTime: [startTime, endTime],
        furnaceNo:"AF1"
      }, 
      queryParams1:{ 
         createTime: [oneHourAgo,now],
      },
      startTime:oneHourAgo,
      defaultStartDate:"", 
      arr:[], 
      time:null, 
      loading: false, 
      selection: null, 
      total: 0, 
      // dataList:{},
      seriesData:[], 
      seriesData1:[], 
      submissonFlag:false,
      defaultTime: [new Date(0,0,0,0,0,0),new Date(0,0,0,0,0,0)],
      combineArray:[],
      keysWithValuesNotNull:[],
      timer:null,
      selectedOption:null,   
      options: [],
      legendArray:[],
      legendArray1:[],
      isConvert:false,
      legendSelected:{},
      legendSelected1:{},
      isDestroyed:false,
      combineArray1:[],
      dataList1:{},
      chartData:[],
      chartData1:[]
    }
  },
  created() {
    // 生成从 n 小时前到当前时间的选项 
    // const now = new Date();
    for (let i = 1; i <= 2; i++) {
      // const date = new Date(now.getTime() - i * 60 * 60 * 1000);
      const value = i * 60 * 60 * 1000
      const label = `${i}小时前`;
      // const value = this.formatDate(date); // 格式化时间
      this.options.push({ label, value });
    }   
  },    
  mounted() { 
    this.clearCharts()
    window.addEventListener("resize", updateChartSize)
    this.handleData()
  },  
  unmounted() {
    window.removeEventListener("resize", updateChartSize)
    this.clearTimer()
    this.clearCharts()
  }, 
  beforeUnmount () {
    // clearInterval(this.timer) 
    this.isDestroyed = true  
  },
  computed: {   
    language() {
      return language[this.$store.state.language]
    }, 
  },
  watch: {
    dataList(){
      this.handleData()
    }, 
    "$store.state.language": function () { 
    //   this.drawCharts()
    //   this.clearTimer()
    //   this.setTimer()
      window.removeEventListener("resize", updateChartSize)
      window.addEventListener("resize", updateChartSize)
    },  
    // "id":{
    //   handler(n){
    //     if(n == 1){
    //         this.clearCharts()
    //       this.clearTimer()
    //       window.removeEventListener("resize", updateChartSize)
    //       window.addEventListener("resize", updateChartSize)
          
    //       this.setTimer()
    //     } else if(n == 2){
    //         this.clearCharts()
    //       this.clearTimer()
    //       window.removeEventListener("resize", updateChartSize)
    //       window.addEventListener("resize", updateChartSize)
   
          
    //       this.setTimer()
    //     }  
    //   }
    // } , 
   
  }, 
  methods: { 
    handleData() { 
      this.clearCharts();
      this.$nextTick(() => {
      if (this.id == 1) {
        window.removeEventListener("resize", updateChartSize)
        window.addEventListener("resize", updateChartSize)
        this.drawCharts(this.legendArray);
        updateChartSize()
      }  else if (this.id == 2) {
        window.removeEventListener("resize", updateChartSize)
        window.addEventListener("resize", updateChartSize)
        this.drawCharts1(this.legendArray2);
        updateChartSize()
      } })
    }, 
    convertChartData1(data){
      const seriesData1 = JSON.parse(JSON.stringify(data))
      const result = {};

      seriesData1.forEach(item => {
          if ('rearOxa' in item) {
              if ('rearOxa' in result) {
                  result['rearOxa'].value.push(item['rearOxa']);
              } else {
                  result['rearOxa'] = { name: 'rearOxa', value: [item['rearOxa']],select:true };
              }
          }
      
          if ('frontOxa' in item) {
              if ('frontOxa' in result) {
                  result['frontOxa'].value.push(item['frontOxa']);
              } else {
                  result['frontOxa'] = { name: 'frontOxa', value: [item['frontOxa']],select:true };
              }
          }
      });
      
      this.combineArray1 = Object.values(result);
      console.log(this.combineArray1,'ddddddddd');
    },

    convertChartData(data){
      var seriesData = JSON.parse(JSON.stringify(data))
      let zValues = [];
      for (const key in seriesData[0]) {
        if (/^z\d+$/.test(key) && seriesData[0][key] !== null) {
          zValues.push(seriesData[0][key]);
        }
      }
      const zArray = []
       for (let i = 0; i < zValues.length; i++) {
        zArray[i] = seriesData.map(v => v['z' + (i + 1)])
      }
      const zoneSpArray = []
      for (let i = 0; i < zValues.length; i++) {
        zoneSpArray[i] = seriesData.map(v => v['zoneSp' + (i + 1)])
      }
      const controlArray = []
      for (let i = 0; i < zValues.length; i++) {
        controlArray[i] = seriesData.map(v => v['control' + (i + 1)])
      }
      const rampArray = []
      for (let i = 0; i < zValues.length; i++) {
        rampArray[i] = seriesData.map(v => v['rampSp' + (i + 1)])
      }
      const zArraySelect = zArray.map((item, index) => {
        return {
          name: `zone${index + 1}`,
          value: item,
          select: true  
        };
      });
      const zoneSpArraySelect = zoneSpArray.map((item, index) => {
        return {
          name: `zoneSp${index + 1}`,
          value: item,
          select: true 
        };
      })
      // const rampArraySelect = rampArray.map((item, index) => {
      //   return {
      //     name: `rampSp${index + 1}`,
      //     value: item,
      //     select: false 
      //   };
      // });
      
      this.combineArray = zArraySelect.concat(zoneSpArraySelect)
      console.log(this.combineArray,'this.combineArray');
    },   
    // hasNonEmptyValue(obj) {
    //   return Object.values(obj).some(value => value !== null && value !== undefined && value !== '');
    // },
    // async  loadRealTimeData(furnaceNo,selectedOption){
    //   if(this.isDestroyed){
    //     return
    //   }
    //   this.seriesData1=[]
    //   const params = {
    //     furnaceNo: furnaceNo == undefined ? "AF1" : furnaceNo ,
    //     // furnaceNo:furnaceNo == undefined ? this.furnaceNo:furnaceNo,
    //     startTime:selectedOption == undefined ? this.formatDate(new Date(new Date().getTime() - 30 * 60 * 1000)) : this.formatDate(new Date(new Date().getTime() - selectedOption)),
    //     // startTime:this.selectedOption,
    //     // startTime:this.formatDate(new Date(new Date().getTime() - this.select)),
    //     endTime:"" ,
    //     threshold: 3
    //   }   
    //   let res = await  getExtractFurnaceTemp(params)
    //   if(res.code == 200){ 
    //     this.dataList = res.data
    //     this.convertChartData(this.dataList);
    //     this.convertChartData1(this.dataList)
    //     this.$nextTick(() =>{
    //       if(this.id == 1){
    //           this.drawCharts(this.legendArray);
    //       } else if(this.id == 2){
    //           this.drawCharts1(this.legendArray1)
    //       }
    //       updateChartSize();
    //     }); 
    //     this.submissonFlag = false  
    //   }   
    // },  
    // setTimer() {   
    //   if(this.timer){
    //       this.clearTimer()
    //   } 
    //   this.timer = setInterval(() => {
    //     // const realTime = new Date(new Date().getTime() -  6 * 1000)
    //     const lastTime = this.dataList[this.dataList.length - 1]?.acqTime
    //     let trimmedTime = lastTime?.slice(0, -10);
    //     let dateObject = new Date(trimmedTime);
    //     dateObject.setSeconds(dateObject.getSeconds() + 1);
        
    //     const params = {
    //       furnaceNo: "AF1",
    //       startTime:this.formatDate(dateObject),
    //       endTime:"",
    //     }  
    //     getFurnaceTemp(params).then(res => { 
    //       this.dataList1 = JSON.parse(JSON.stringify(res.data))  
    //       this.dataList.push(...this.dataList1)
    //       this.dataList.splice(0,this.dataList1.length)
    //       this.convertChartData(this.dataList)
    //       this.convertChartData1(this.dataList)
    //       // delete this.dataList1.furnaceNo;    
    //       // Object.keys(this.dataList1).forEach(key => {
    //       //     if (this.dataList1[key] && Array.isArray(this.dataList1[key]) ) {
    //       //       this.dataList[key] = this.dataList[key].concat(this.dataList1[key]); 
    //       //       this.dataList[key] = this.dataList[key].slice(this.dataList1[key].length );   
    //       //       // if( this.dataList1[key].length > 2){
    //       //       //   this.dataList[key] = this.dataList[key].slice(this.dataList1[key].length );
    //       //       // }
    //       //     } 
    //       // });   
    //       this.$nextTick(() =>{
    //         if(this.id == 1){
    //           this.drawCharts(this.legendArray);
    //           updateChartSize()
    //         } else if(this.id == 2){
    //           this.drawCharts1(this.legendArray1)
    //           updateChartSize()
    //         } 
    //       })   
    //     })    
    //   }, 6000)   
    // }, 
    
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }, 
  
    filterArr(id) {
      this.arr = this.language.business.furnace.filter(item => {
        return item.id.indexOf(id) !== -1
      })
    },    
    dateFormatter (row, column, cellValue) {
      return new Date(Date.parse(cellValue)).Format("yyyy-MM-dd hh:mm:ss")
    },  
    // getFurnaceData(){   
    //     console.log(this.selTime,'seltieseltime');
    //    const oneHourAgo = new Date(new Date().getTime() - this.selTime * 60 * 60 * 1000); 
    //     // 格式化时间为字符串（ISO 格式)
    //     // const formatTime = (time) => time.toISOString().slice(0, 19).replace('T', ' ');
    //   // console.log(this.selectedOption,'开始时间额');
    //   this.clearCharts()
    //   this.loading = true
    //   this.submissonFlag = true
    //   this.$emit('transfer', this.submissonFlag)
    //   this.seriesData1=[]
    //   const params =  {
    //     furnaceNo: this.queryParams.furnaceNo,
    //     // startTime: this.queryParams.createTime == null ? "" : this.queryParams.createTime[0],
    //     // endTime: this.queryParams.createTime == null ? "" : this.queryParams.createTime[1]
    //     // startTime:this.queryParams1.createTime[0], 
    //     // startTime:"2024-04-03T00:00:00",
    //     // endTime:"2024-04-03T00:20:00",
    //     startTime:this.formatDate(oneHourAgo),
    //     endTime:"",
    //   }    
    //   getFurnaceTemp(params).then(res => {
    //     console.log(res)    
        
    //     if(res.data){  
    //       this.dataList = JSON.parse(JSON.stringify(res.data))
    //       // delete this.dataList.furnaceNo;
    //       console.log(this.dataList,'newDatanewData');
    //        this.convertChartData(this.dataList)
    //        this.convertChartData1(this.dataList)
    //       //  if(this.combineArray){
    //       //   this.chartData = this.combineArray
    //       //  }
    //       //  if(this.combineArray1){
    //       //   this.chartData1 = this.combineArray1
    //       //  }
    //       this.$nextTick(() => {
    //         if(this.id == 1){
    //           this.drawCharts(this.legendArray);
    //           updateChartSize()
    //         } else if(this.id == 2){
    //             this.drawCharts1(this.legendArray1)
    //             updateChartSize()
    //         } 
             
    //       }) 
    //       this.loading = false
    //       this.submissonFlag = false
    //       this.$emit('transfer', this.submissonFlag)
    //       if(this.dataList && this.dataList.length > 0){
    //         this.setTimer()
    //       }
    //     } else {
    //       this.loading = false
    //       this.submissonFlag = false
    //       this.$emit('transfer', this.submissonFlag)
    //       this.clearCharts()
    //       this.$message({
    //           type: "warning",
    //           message: this.language.tips.emptyResult
    //       })
    //     }        
    //   }).catch((err) =>{
    //     console.log(err)
    //     setTimeout(() =>{
    //       this.loading = false
    //       this.submissonFlag = false
    //     },1000)
    //   })  
    // },    
    drawCharts(legendArray) {  
      // 获取最早和最晚的时间点 
      let that = this
      // const beginTime = new Date(this.dataList[0]?.acqTime)
      // const newTime = new Date(beginTime.getTime() + 1* 60 * 60 * 1000); // 加上 30 分钟
      // const beginValue = beginTime.toLocaleString()
      // const newValue = newTime.toLocaleString()

      var chartDom = document.getElementById(`echarts-${this.id}`)  
      allBoxes.push(chartDom)
      var myChart = echarts.init(chartDom)
      allCharts.push(myChart) 
      
      // var seriesList = []
      // for(var i = 0;i<this.combineArray.length;i++){ 
      //   const seriesData = this.combineArray[i].value.map((item, index) => {
      //     return [this.dataList[index].acqTime, item];
      //   });  
      //   seriesList.push({
      //       type: 'line',  
      //       emphasis: { focus: "series" },
      //       data:seriesData,
      //       name:this.combineArray[i].name,
        
      //    }) 
      //   this.legendSelected[this.combineArray[i].name] = this.combineArray[i].select;
        
      // } 
    console.log(this.dataList,'实时数据');
    
    const seriesList = [];

    const keys = Object.keys(this.dataList[0]).filter(key => this.dataList[0][key] !== null && key.startsWith('z'));
  
    
    
    
    keys.forEach(key => {
      const seriesData = this.dataList.map(item =>[item.acqTime,item[key]]);
    
      seriesList.push({
        type: 'line',
        emphasis: { focus: 'series' },
        data: seriesData,
        name: key,
        select: true,
        sampling:'lttb', 
      }); 
    }); 
    
    console.log(seriesList);
    for(var i = 0;i < seriesList.length;i++){
      this.legendSelected[seriesList[i].name] = seriesList[i].select
    }
    if (legendArray!== []) {
      Object.assign(this.legendSelected,legendArray)
    }
      
      var option
      option = {
        title: {},
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },   
          formatter: function (params) {
            var res = ""
            for (var i = 0; i < params.length; i++) {
              var series = params[i]
              var date = new Date(series.data[0])
              if (series.seriesName == window.selectSeries) {
               res =  
                  series.marker +
                  series.seriesName +
                   ":" +
                  date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + 
                  "," +
                  series.data[1]  
                  break  
              } 
            }      
            return res  
          },   
        },         
        legend: {
          top:5,
          left:"center", 
          // data:this.keysWithValuesNotNull.map(item => item),
          data:seriesList.map(item => item.name),
          // data:seriesList.map(item => item.name),
          selected:this.legendSelected,
          formatter: ["{a|{name}}"].join("\n"),  
          textStyle: {
            rich: {
              a: {
                width: 55,
                fontSize: 12,
                lineHeight: 12,
              },
            },   
          },  
        },      
        grid: {   
         // width: 1650, // 设置图表的宽度
         // height: 550,
          left: "6%",
          right: "10%",
          bottom: "25%",
          top: "32%",
          // containLabel: true, 
        },
        toolbox: {
          top:120,
          right:30,
           itemSize: 16,
           emphasis: {
           iconStyle: {
             borderColor: "#409EFF",
            },    
           },    
          feature: {
            myToggleSeries: {
            show: true,
            title: this.language.ui.toggleSelection,
            icon: 'M949.333333 424.533333h-874.666666c-12.8 0-23.466667-8.533333-29.866667-19.2-4.266667-12.8-2.133333-25.6 6.4-36.266666l149.333333-166.4c12.8-12.8 32-14.933333 44.8-2.133334 12.8 12.8 12.8 34.133333 2.133334 46.933334L149.333333 356.266667h802.133334c17.066667 0 32 14.933333 32 34.133333-2.133333 19.2-17.066667 34.133333-34.133334 34.133333zM74.666667 599.466667h874.666666c12.8 0 23.466667 8.533333 29.866667 19.2 4.266667 12.8 2.133333 25.6-6.4 36.266666l-149.333333 166.4c-12.8 12.8-32 14.933333-44.8 2.133334-12.8-12.8-12.8-34.133333-2.133334-46.933334l98.133334-108.8H74.666667c-17.066667 0-32-14.933333-32-34.133333 0-19.2 14.933333-34.133333 32-34.133333z',
            onclick: function() {
              const array = myChart.getOption().legend[0].selected
              that.isConvert = !that.isConvert
              if(!that.isConvert){
                Object.keys(array).forEach(key => {
                  array[key] = !array[key];
                });
                Object.assign(that.legendArray,array)
              } else {
                Object.keys(array).forEach(key => {
                  array[key] = !array[key];
                });
                Object.assign(that.legendArray,array)
              }
              that.drawCharts(that.legendArray)
              // myChart.dispatchAction({
              // type: 'legendInverseSelect'
              // })
              },
            },
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "time",
          name: this.language.process.time,
          axisLabel:{
            rotate:25,
            formatter: function(value) {
              return new Date(value).Format("yyyy/MM/dd hh:mm:ss")
            }
          }
        },
        yAxis: {
          type: "value",
          // min: 0,
          // max: 30,
          scale:true,     
          // name: this.language.process.temperature,
          name:"℃"
        },
        // dataZoom: dataZoomOption,
        series:seriesList
      }   
      myChart.on("mousemove", function (params) {
        window.selectSeries = params.seriesName
      })     
      myChart.on("mouseout", function () {
        window.selectSeries = ""
      })     
      myChart.off('legendselectchanged')  
      myChart.on('legendselectchanged', function(params){  
       Object.assign(that.legendArray,params.selected) 
        // that.legendArray = params.selected 
        that.drawCharts(that.legendArray)
      }) 
      option && myChart.setOption(option, true)
    },  
    drawCharts1(legendArray) {
      // 获取最早和最晚的时间点 
      let that = this
    //   const beginTime = new Date(this.dataList[0]?.acqTime)
    //   const newTime = new Date(beginTime.getTime() + 1* 60 * 60 * 1000); // 加上 30 分钟
    //   const beginValue = beginTime.toLocaleString()
    //   const newValue = newTime.toLocaleString()
      
      var chartDom = document.getElementById(`echarts-${this.id}`)
      allBoxes.push(chartDom)
      var myChart = echarts.init(chartDom)
      allCharts.push(myChart) 

      const seriesList = [];

      const keys = Object.keys(this.dataList[0]).filter(key => this.dataList[0][key] !== null && key.includes('Oxa'));
     
      // Create series for each key
      keys.forEach(key => {
        const seriesData = this.dataList.map(item =>[item.acqTime,item[key]]);
      
        seriesList.push({
          type: 'line',
          emphasis: { focus: 'series' },
          data: seriesData,
          name: key,
          select: true,
          sampling:'lttb',
        });
      });
      
      console.log(seriesList);
      

      for(var i = 0;i < seriesList.length;i++){
        this.legendSelected[seriesList[i].name] = seriesList[i].select
      }

      if (legendArray!== []) {
        Object.assign(this.legendSelected,legendArray)
      }
      
      // var seriesList = [] 
      // for(var i = 0;i<this.combineArray1.length;i++){
      //   const seriesData = this.combineArray1[i].value.map((item, index) => {
      //     return [this.dataList[index].acqTime, item];
      //   });  
      //   seriesList.push({
      //       type: 'line',  
      //       emphasis: { focus: "series" },
      //       data:seriesData,
      //       name:this.combineArray1[i].name,
      //   }) 
      //   this.legendSelected1[this.combineArray1[i].name] = this.combineArray1[i].select;
        
      // } 
      // if (legendArray!== []) {
      //   Object.assign(this.legendSelected1,legendArray)
      // }
      
      var option
      option = {
        title: {}, 
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },   
          formatter: function (params) {
            var res = ""
            for (var i = 0; i < params.length; i++) {
              var series = params[i]
              var date = new Date(series.data[0])
              if (series.seriesName == window.selectSeries) {
               res =
                  series.marker +
                  series.seriesName +
                   ":" +
                  date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + 
                  "," +
                  series.data[1]  
                  break  
              }
            }      
            return res  
          }, 
        },         
        legend: {
          top:5,
          left:"center", 
          // data:this.keysWithValuesNotNull.map(item => item),
          // data:seriesList.map(item => item.name),
          data:seriesList.map(item => item.name),
          selected:this.legendSelected1,
          formatter: ["{a|{name}}"].join("\n"),  
          textStyle: {
            rich: {
              a: {
                width: 55,
                fontSize: 12,
                lineHeight: 12,
              },
            },   
          },  
        },      
        grid: {   
         // width: 1650, // 设置图表的宽度
         // height: 550,
          left: "6%",
          right: "10%",
          bottom: "25%",
          top: "32%",
          // containLabel: true, 
        },
        toolbox: {
          top:120,
          right:30,
           itemSize: 16,
           emphasis: {
           iconStyle: {
             borderColor: "#409EFF",
            },    
           },    
          feature: {
            // myToggleSeries: {
            // show: true,
            // title: this.language.ui.toggleSelection,
            // icon: 'M949.333333 424.533333h-874.666666c-12.8 0-23.466667-8.533333-29.866667-19.2-4.266667-12.8-2.133333-25.6 6.4-36.266666l149.333333-166.4c12.8-12.8 32-14.933333 44.8-2.133334 12.8 12.8 12.8 34.133333 2.133334 46.933334L149.333333 356.266667h802.133334c17.066667 0 32 14.933333 32 34.133333-2.133333 19.2-17.066667 34.133333-34.133334 34.133333zM74.666667 599.466667h874.666666c12.8 0 23.466667 8.533333 29.866667 19.2 4.266667 12.8 2.133333 25.6-6.4 36.266666l-149.333333 166.4c-12.8 12.8-32 14.933333-44.8 2.133334-12.8-12.8-12.8-34.133333-2.133334-46.933334l98.133334-108.8H74.666667c-17.066667 0-32-14.933333-32-34.133333 0-19.2 14.933333-34.133333 32-34.133333z',
            // onclick: function() {
            //   const array = myChart.getOption().legend[0].selected
            //   that.isConvert = !that.isConvert
            //   if(!that.isConvert){
            //     Object.keys(array).forEach(key => {
            //       array[key] = !array[key];
            //     });
            //     Object.assign(that.legendArray,array)
            //   } else {
            //     Object.keys(array).forEach(key => {
            //       array[key] = !array[key];
            //     });
            //     Object.assign(that.legendArray,array)
            //   }
            //   that.drawCharts(that.legendArray)
            //   // myChart.dispatchAction({
            //   // type: 'legendInverseSelect'
            //   // })
            //   },
            // },
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "time",
          name: this.language.process.time,
          axisLabel:{
            rotate:25,
            formatter: function(value) {
              return new Date(value).Format("yyyy/MM/dd hh:mm:ss")
            }
          }
        },
        yAxis: {
          type: "value",
          // min: 0,
          // max: 30,
          scale:true,
          name: 'ppm',
        },
        // dataZoom: dataZoomOption,
        series:seriesList
      }  
      myChart.on("mousemove", function (params) {
        window.selectSeries = params.seriesName
      })     
      myChart.on("mouseout", function () {
        window.selectSeries = ""
      })     
      myChart.off('legendselectchanged')  
      myChart.on('legendselectchanged', function(params){  
       Object.assign(that.legendArray1,params.selected) 
        // that.legendArray = params.selected 
        that.drawCharts1(that.legendArray1)
      }) 
      option && myChart.setOption(option, true)
    },        
    clearTimer() {
      if (this.timer) {
        window.clearInterval(this.timer)
        this.timer = null
      }  
    },  
    clearCharts() {
      for (const chart of allCharts) {
        chart.clear()
        chart.dispose()
      }
      allCharts.splice(0)
      allBoxes.splice(0)
    },
             
    handleQuery(furnaceNo,selectedOption) {   
        // console.log(furnaceNo,selectedOption); 
      this.clearCharts()
      this.submissonFlag = true
      this.getFurnaceData(furnaceNo,selectedOption)
    //   if(this.id == 1){
        // setTimeout(() => {
        // }, 0);
    //   } else {
        // this.clearCharts()
        // this.getFurnaceData()  
        // this.drawCharts() 
    //   }    
    },  
  },  
}     
</script>

<style lang="scss">
.monitor-container{
  height: 100%;
  width: 100%;
  margin-top: 10px;
}

</style>