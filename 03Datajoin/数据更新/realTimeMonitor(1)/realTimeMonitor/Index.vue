<template>
  <div class="main-body-wrapper realTime-list">
    <el-form @submit.prevent @keyup.enter="handleQuery"  ref="queryRef" :inline="true">
    <el-form-item class="thin-select">
       <el-select
         v-model="furnaceNo"
         :placeholder="language.ui.prompt.selectPlease"
       >
        <template
          v-for="value in language.business.furnace"
          :key="value.id"
        >
          <el-option
            :label="value.no"
            :value="value.id"
           />
        </template>
      </el-select>
    </el-form-item>
    <el-form-item style="margin-right: 10px;">
      <!-- <el-date-picker
        v-model="queryParams1.createTime[0]"
        type="datetime"
        :placeholder="language.ui.startTime"
      /> -->
      <el-select v-model="selectedOption" :placeholder="language.ui.selectTime">
        <el-option
          v-for="(option, index) in language.realtimeOptions"
          :key="index"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <!-- <el-form-item v-else class="thin-select">
      <el-date-picker
        v-model="queryParams.createTime"
        type="datetimerange"
        value-format="YYYY-MM-DDTHH:mm:ss"
        :range-separator="language.ui.to"
        :start-placeholder="language.ui.startTime"
        :end-placeholder="language.ui.endTime"
        :default-time="defaultTime"
      />
    </el-form-item> -->
    <el-form-item>
      <el-button :disabled="submissonFlag" class="btn-search" type="success" icon="Search" @click="handleQuery">{{
        language.ui.search
      }}</el-button>
    </el-form-item>
  </el-form>
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane v-for="(item) in language.monitor" :key="item.no" :label="item.name" :name="item.no">
          <tab-process :virableNo="virableNo" :displayedLines1="displayedLines" :keys="keys" :emptyKey="emptyKey" @transfer ="setButtonStatus"  :dataList="dataList" :selTime="startTime" ref="child" :id="item.no" v-if="item.no == activeName"/>
        </el-tab-pane> 
      </el-tabs>
  </div>
</template> 
<script> 

import language from "@/locale/lang"
import TabProcess from './TabProcess.vue' 
import {getFurnaceTemp} from "@/api/monitor"

import { monitorQuery } from "@/api/monitor";
import "@/mock/monitor";


// import {getExtractFurnaceTemp} from "@/api/monitor"

export default {
  components: {
    TabProcess
  },
  data() {
    const startTime = new Date();
    const endTime = new Date(startTime);
    startTime.setHours(startTime.getHours() - 72);
    // const label = this.language.options.hourAgo
    return {
      steelGradeList_original: [],
      activeName: 1,
      submissonFlag:false,
      selectedOption:0.5, 
      furnaceNo:"AF1",
      options: [],
      key:false,
      // startTime:oneHourAgo,
      dataList:[],
      dataList1:[],
      timer:null,
      legendArray:[],
      startTime:0.5,
      emptyKey:false,
      keys:[],
      displayedLines:[],
      virableNo:0 ,
      queryParams: {
        createTime: [startTime, endTime],
        currentPage: 1,
        pageSize: 15,
        furnaceNo:''
      }, 
      fakeData:[],

    }  
  }, 
  mounted() { 
   
    this.getFurnaceData()
    // this.setTimer()
  },

  unmounted() {
    // window.removeEventListener("resize", updateChartSize)
    this.clearTimer()
  },
  computed: {
    language() {
      return language[this.$store.state.language]
    } 
  },
  watch: {
  }, 
  methods:  {

    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }, 
    handleQuery() {  
      this.startTime = this.selectedOption  
      this.getFurnaceData()
    },
    clearTimer() {
      if (this.timer) {
        window.clearInterval(this.timer)
        this.timer = null 
      }  
    },
    setTimer() {   
      if(this.timer){
          this.clearTimer()
      } 
      this.timer = setInterval(() => {
        monitorQuery(this.queryParams).then(res =>{
          
          
          const maxLength = 380
          const newData = JSON.parse(JSON.stringify(res.data))
          this.dataList.push(...newData)
          this.dataList.splice(0,newData.length);
          if(this.dataList.length > maxLength){
            this.dataList = this.dataList.slice(-maxLength)
          }
          this.virableNo ++
          if(this.virableNo > 100){
            this.virableNo = 0
          }
      
          
        })
      },1000)
      // this.timer = setInterval(() => {
      //   const lastTime = this.dataList[this.dataList.length - 1]?.acqTime
      //   let dateObject = new Date(lastTime);
      //   dateObject.setSeconds(dateObject.getSeconds() + 6);
      //   console.log(this.formatDate(dateObject));
      //   const params = {
      //     startTime:this.formatDate(dateObject),
      //     endTime:"",
      //     furnaceNo:this.furnaceNo
      //   }  
      //   getFurnaceTemp(params).then(res => { 
      //     const newData = JSON.parse(JSON.stringify(res.data))
      //     this.dataList.push(...newData)
      //     this.dataList.splice(0,newData.length);
      //     this.virableNo ++
      //     if(this.virableNo > 100){
      //       this.virableNo = 0
      //     }
      //     // this.dataList = [...this.dataList]
      //   })    
      // }, 10000)   
    },
    getFurnaceData(){   
      const oneHourAgo = new Date(new Date().getTime() - this.startTime * 60 * 60 * 1000); 
      this.submissonFlag = true

      this.seriesData1=[]
      const params =  {
        furnaceNo: this.furnaceNo,
        startTime:this.formatDate(oneHourAgo),
        endTime:"",
      }    
      getFurnaceTemp(params).then(res => { 
        
        if(res.data.length > 0){  
          this.dataList = JSON.parse(JSON.stringify(res.data))
          this.keys = Object.keys(this.dataList[0]).filter((key) => key.startsWith('z') && this.dataList[0][key] !== null);
          this.displayedLines = Object.keys(this.dataList[0]).filter((key) => key.startsWith('z') && this.dataList[0][key] !== null);
          
          this.loading = false
          this.submissonFlag = false
          this.setTimer()
        } else {
          this.loading = false
          this.submissonFlag = false
          // this.$emit('transfer', this.submissonFlag)
          this.clearTimer()
          this.emptyKey = !this.emptyKey
          this.$message({
              type: "warning",
              message: this.language.tips.emptyResult
          })
        }        
      }).catch((err) =>{
        console.log(err)
        setTimeout(() =>{
          this.loading = false
          this.submissonFlag = false
        },1000)
      })  
    },   
    setButtonStatus(msg){
      this.submissonFlag = msg
    }
    
  }
}
</script>

<style lang="scss">

.realTime-list {
   .thin-select{
      margin-right: 10px;
      .el-select{
        width: 160px;
      }
      .el-date-editor{
        width: 200px;
      }
   }
    td.column-right {
      div.cell {
          display: flex;
          justify-content: right;
      }
    }

  .report-download.el-tag {
    cursor: pointer;
  }
}

</style> 