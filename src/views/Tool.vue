<template>
  <div class="wrap" @mouseenter="mouseenter" @mouseleave="mouseleave">
    <div class="mask" v-if="loading">
      <p class="center">正在加载中...</p>
    </div>
    <div class="left-top">
      <el-form
        size="mini"
        ref="form"
        :inline="true"
        :model="sceneConfig"
        label-width="50px"
      >
        <el-form-item label="appkey:">
          <el-input v-model="sceneConfig.appkey"></el-input>
        </el-form-item>
        <el-form-item label="经度:">
          <el-input v-model="sceneConfig.longitude"></el-input>
        </el-form-item>
        <el-form-item label="纬度:">
          <el-input v-model="sceneConfig.latitude"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" @click="loadScene" round
          >加载场景</el-button
        >
      </el-form>
    </div>
    <div
      v-show="showTollWrap"
      class="right-top collapse"
      :class="{ collapsed: isCollapse }"
    >
      <span class="open-close" 
        @click="isCollapse = !isCollapse">
        {{ isCollapse ? "展开" : "收起" }}
      </span>
      <div class="menu">
        <div class="tips">
          Tips: 请在
          <el-button 
            class="resetPitch" 
            @click="resetPitch" 
            type="text">
            正摄视角
          </el-button>
          下进行绘制或坐标拾取操作；请逆时针绘制包围盒
        </div>
        <el-row>
          <el-button size="mini" 
            :disabled="isOperating" 
            @click="handlePick">
            {{ !isPicking ? "拾取坐标点" : "左键拾取" }}
          </el-button>
          <el-button
            size="mini"
            @click="cancelPick"
            :disabled="isOperating && !isPicking"
            >取消</el-button
          >
        </el-row>
        <el-row>
          <el-button
            size="mini"
            :disabled="isOperating && !isMarking"
            @click="handleAddMarker"
            >{{ !isMarking ? "添加标注" : "左击添加" }}</el-button
          >
          <el-button 
            size="mini" 
            :disabled="isOperating" 
            @click="clearLastMaker"
            >清除当前标注</el-button
          >
        </el-row>
        <el-row>
          <el-button 
            size="mini" 
            :disabled="isOperating" 
            @click.stop.prevent="getCameraInfo"
            >获取相机信息</el-button
          >
        </el-row>
        <el-row>
          <div class="flex-col">
            <div class="flex-col-center">
              <el-button
                size="mini"
                :disabled="isOperating && (isMarking || isPicking || isDrawing)"
                @click="handleDraw"
              >
                {{ isMarking || !isDrawing ? "绘制包围盒" : "左击添加点" }}
              </el-button>
              <!-- <el-button size="mini" >添加点</el-button> -->
              <el-button
                style="min-width: 100px"
                size="mini"
                :disabled="isOperating && (posStack.length < 3 || !isDrawing)"
                @click="handleDrawPop"
              >
                撤销点
              </el-button>
            </div>
            <div class="flex-col-center bottom">
              <el-button
                size="mini"
                :disabled="isOperating && !isDrawing"
                @click="handleDrawEnd"
              >
                结束绘制
              </el-button>
              <el-button
                size="mini"
                :disabled="isOperating"
                @click="clearLastOverlap"
              >
                清除当前包围盒
              </el-button>
            </div>
          </div>
        </el-row>
        
        <div class="flex-row flex-row-center">
          <el-button 
            size="mini" 
            :disabled="isOperating"
            @click="clearAllMaker">清除所有标注</el-button>
          <el-button 
            size="mini" 
            :disabled="isOperating"
            @click="clearAllOverlap"
            >清除所有包围盒</el-button>
        </div>
      </div>
    </div>
    <div v-show="showMarkerWrap" class="right-top marker-config">
      <div>
        <span class="title">标注配置：</span>
        <div class="flex-row">
          <span class="label">经纬高：</span>
          <div class="input-wrap">
            <el-input
              :disabled="true"
              size="mini"
              v-model="curPosition.longitude"
            ></el-input>
            <el-input
              :disabled="true"
              size="mini"
              v-model="curPosition.latitude"
            ></el-input>
            <el-input
              :disabled="true"
              size="mini"
              v-model="curPosition.height"
            ></el-input>
          </div>
        </div>
        <div class="flex-row">
          <span class="label">标注名: </span>
          <div class="input-wrap">
            <el-input size="mini" v-model="markerConfig.label"></el-input>
          </div>
        </div>
        <div class="flex-row">
          <span class="label">图标Url: </span>
          <div class="input-wrap">
            <el-input size="mini" v-model="markerConfig.iconPath"></el-input>
          </div>
        </div>
        <div class="flex-col near-far-scale">
          <span class="title">标注渐变效果: </span>
          <div class="flex-row">
            <span class="label">近处距离:</span>
            <div class="input-wrap">
              <el-input
                size="mini"
                v-model="markerConfig.nearFarScalar.distance1"
              ></el-input>
            </div>
            <span class="label right">缩放倍数:</span>
            <div class="input-wrap">
              <el-input
                size="mini"
                v-model="markerConfig.nearFarScalar.scale1"
              ></el-input>
            </div>
          </div>
          <div class="flex-row">
            <span class="label">远处距离:</span>
            <div class="input-wrap">
              <el-input
                size="mini"
                v-model="markerConfig.nearFarScalar.distance2"
              ></el-input>
            </div>
            <span class="label right">缩放倍数:</span>
            <div class="input-wrap">
              <el-input
                size="mini"
                v-model="markerConfig.nearFarScalar.scale2"
              ></el-input>
            </div>
          </div>
        </div>
        <div class="flex-row flex-row-center">
          <el-button size="mini" type="" @click="cancelMarker">取消</el-button>
          <el-button size="mini" type="primary" @click="confirmMarker"
            >确认</el-button
          >
        </div>
      </div>
    </div>
    <div v-show="showOverlapWrap" class="right-top marker-config overlap-config">
      <div>
        <span class="title">包围盒配置：</span>
        <div class="flex-row">
          <span class="label">包围盒名称: </span>
          <div class="input-wrap">
            <el-input size="mini" v-model="overlapConfig.label"></el-input>
          </div>
        </div>
        <div class="flex-row flex-row-center">
          <el-button size="mini" type="" @click="cancelDrawEnd">取消</el-button>
          <el-button size="mini" type="primary" @click="confirmDrawEnd"
            >确认</el-button
          >
        </div>
      </div>
    </div>
    <div class="left-bottom">
      <span class="title"
        >日志信息：
        <el-button
          v-show="logList.length"
          type="text"
          size="mini"
          @click="logList = []"
          >清除</el-button
        >
      </span>
      <div class="log-list" ref="log-list">
        <span v-for="item in logList" :key="item.id" class="log">
          <span class="time"> {{ item.time }} </span> <br />
          <span class="content">
            <span class="label">{{ item.title }}</span> {{ item.content }}
          </span>
        </span>
      </div>
    </div>
    <span id="mouse-tips" class="mouse-tips" v-show="showTips && isOperating">{{
      tipsDict[operateStatus] || ""
    }}</span>

    <Readme />
  </div>
</template>

<script>
import { initScene, initEvent, screen2Cartographic, getTime, runPitchAnimation } from "./utils";
import { getHeightBycoord } from "../api/api";
import Readme from "./Readme";
import { BASE_CONFIG } from "../config";

// 预置默认数据
const sceneConfig = BASE_CONFIG().sceneConfig;

const tipsDict = {
  pick: "点击鼠标左键拾取",
  mark: "点击鼠标左键添加",
  draw: "点击鼠标左键添加绘制点,请逆时针绘制"
};

let uid = 0;
let offsetY = 0;
const markerPath =
    "//amapmobile.airlook.com/1.1.2/Assets/images/location-marker.png",
  markerLabel = "X小区#15-20-01";
const overlapLabel = "X小区#15号楼";
let curMarker,
  markerList = [];
let curPolyline;
let curOverlap,
  overlapList = [];

export default {
  name: "Tool",
  components: {
    Readme
  },
  data() {
    return {
      sceneConfig: {
        appkey: sceneConfig.appkey,
        longitude: sceneConfig.longitude,
        latitude: sceneConfig.latitude
      },
      logList: [], // 为限制长度 需要优化
      cancelFn: undefined,
      isOperating: false,
      isPicking: false,
      loading: true,
      curPosition: {},
      showMarkerWrap: false,
      markerConfig: {
        iconPath: markerPath,
        label: markerLabel,
        nearFarScalar: {
          distance1: 100,
          scale1: 1,
          distance2: 1000,
          scale2: 0.2
        }
      },
      isMarking: false,
      isDrawing: false,
      posStack: [],
      isCollapse: false,
      tipsDict: tipsDict,
      showTips: false,
      showOverlapWrap: false,
      overlapConfig: {
        label: overlapLabel
      }
    };
  },
  computed: {
    operateStatus() {
      return this.isPicking
        ? "pick"
        : this.isMarking
        ? "mark"
        : this.isDrawing
        ? "draw"
        : "";
    },
    showTollWrap() {
      return !this.showMarkerWrap && !this.showOverlapWrap;
    }
  },
  watch: {
    markerConfig: {
      handler: function(val) {
        this.$nextTick(() => {
          this.updateMarker(val, curMarker);
        });
      },
      deep: true
    },
    posStack(val) {
      const len = val.length;
      if (len > 1) {
        this.$nextTick(() => {
          this.darwLine([...val, val[0]]);
        });
      }
    }
  },
  mounted() {
    this.loadScene();
  },
  methods: {
    async loadScene() {
      try {
        this.loading = true;
        this.isOperating = false;
        this.isPicking = false;
        this.isMarking = false;
        this.isDrawing = false;

        const { data: { altitude: height } } = await getHeightBycoord({
          appKey: this.sceneConfig.appkey,
          longitude: this.sceneConfig.longitude,
          latitude: this.sceneConfig.latitude
        });

        const { status } = await initScene(
          Object.assign({ height }, { ...this.sceneConfig })
        );
        // console.log(status);
        if (status == "no_data") {
          alert("此范围无三维数据, 初始化失败");
        }
        setTimeout(() => {
          this.loading = false;
        }, 500);
      } catch (error) {
        this.loading = false;
        alert("初始化失败");
        console.error("loadScene", error);
      }
    },
    cancelPick() {
      if (this.cancelFn) {
        this.cancelFn();
        this.cancelFn = null;
      }
      this.isOperating = false;
      this.isPicking = false;
    },
    handlePick() {
      this.isPicking = true;
      this.isOperating = true;

      const map = window.map;
      if (map) {
        // map.camera.pitch = AirlookMap.Math.toRadians(90);
        const tips = document.querySelector("#mouse-tips");
        this.cancelFn = initEvent({
          dom: map.scene.canvas,
          name: "pick",
          clickCb: ({ x, y }) => {
            this.curPosition = screen2Cartographic(x, y, map);
            // console.log(this.curPosition);
            this.updateLog({
              id: uid++,
              time: getTime(),
              title: "*坐标点* ：",
              content: JSON.stringify(this.curPosition)
            });
          },
          mousemoveCb: ({ x, y }) => {
            [tips.style.left, tips.style.top] = [x + 6 + "px", y - 10 + "px"];
          }
        });
        runPitchAnimation(map);
      }
    },
    getCameraInfo() {
      const map = window.map;
      if (map) {
        let res = Object.create(null);
        const cartographic = map.camera.positionCartographic;

        res = Object.assign(res, {
          longitude: AirlookMap.Math.toDegrees(cartographic.longitude),
          latitude: AirlookMap.Math.toDegrees(cartographic.latitude),
          height: cartographic.height,
          heading: map.camera.heading,
          pitch: map.camera.pitch
        });

        this.updateLog({
          id: uid++,
          time: getTime(),
          title: "*相机参数：",
          content: JSON.stringify(res)
        });
      }
    },
    handleAddMarker() {
      // 1. 地图选点 获取坐标  2. 弹窗参数配置  3. 确定后打印，marker 不移除
      let map = window.map;
      const tips = document.querySelector("#mouse-tips");
      this.cancelFn = initEvent({
        dom: map.scene.canvas,
        name: "pick",
        clickCb: ({ x, y }) => {
          const cartographic = AirlookMap.MathUtils.screenToCartographic(
            new AirlookMap.Cartesian2(x, y),
            map
          );
          const longitude = AirlookMap.Math.toDegrees(cartographic.longitude); // 经度
          const latitude = AirlookMap.Math.toDegrees(cartographic.latitude); // 纬度
          const height = cartographic.height; // 高度
          this.curPosition = { longitude, latitude, height };
          this.addMarker(this.curPosition);
          // console.log(this.curPosition);
          this.isMarking = false;
          this.cancelFn();
        },
        mousemoveCb: ({ x, y }) => {
          [tips.style.left, tips.style.top] = [x + 6 + "px", y - 10 + "px"];
        }
      });
      this.isOperating = true;
      this.isMarking = true;
    },
    addMarker({ longitude, latitude, height }) {
      const map = window.map;
      if (!map) return;
      this.showMarkerWrap = true;
      curMarker = window.curMarker = new AirlookMap.Marker({
        position: AirlookMap.Cartographic.fromDegrees(
          longitude,
          latitude,
          height
        ),
        scaleByDistance: new AirlookMap.NearFarScalar(100, 1, 1000, 0.2),
        show: true,
        label: markerLabel,
        iconPath: markerPath
        // onClick: function(e) {
        //   console.log(e.position);
        // }
      });
      map.add(curMarker);
    },
    updateMarker(val, curMarker) {
      // console.log(val, curMarker);
      if (!curMarker) return;
      if (!/\/\/[\S\s]+(\.(jpe?g|png))$/.test(val.iconPath)) {
        console.error("iconPath Url 参数不合法");
        return;
      }
      curMarker.iconPath = val.iconPath || markerPath;
      curMarker.label = val.label || markerLabel;
      curMarker.scaleByDistance = new AirlookMap.NearFarScalar(
        +val.nearFarScalar.distance1,
        +val.nearFarScalar.scale1,
        +val.nearFarScalar.distance2,
        +val.nearFarScalar.scale2
      );
    },
    cancelMarker() {
      this.showMarkerWrap = false;
      this.isMarking = false;
      this.isOperating = false;
      let map = window.map;
      if (map) {
        map.remove(curMarker);
      }
    },
    clearLastMaker() {
      if (!window.map) return;
      const map = window.map;
      map.remove(markerList.pop());
    },
    confirmMarker() {
      // 添加marker 参数校验
      this.showMarkerWrap = false;
      this.isMarking = false;
      this.isOperating = false;
      const { longitude, latitude, height } = this.curPosition;
      let res = {
        longitude,
        latitude,
        height,
        iconPath: this.markerConfig.iconPath,
        nearFarScalar: {
          near: this.markerConfig.nearFarScalar.distance1,
          nearScale: this.markerConfig.nearFarScalar.scale1,
          far: this.markerConfig.nearFarScalar.distance2,
          farScale: this.markerConfig.nearFarScalar.scale2
        },
        label: this.markerConfig.label,
      };
      this.updateLog({
        id: uid++,
        time: getTime(),
        title: `${this.markerConfig.label} *标注信息* ：`,
        content: JSON.stringify(res)
      });
      markerList.push(curMarker);
    },
    handleDraw() {
      this.isOperating = true;
      this.isDrawing = true;
      const map = window.map;
      if (!map) return;
      const tips = document.querySelector("#mouse-tips");
      this.cancelFn = initEvent({
        dom: map.scene.canvas,
        name: "pick",
        clickCb: ({ x, y }) => {
          this.curPosition = screen2Cartographic(x, y, map);
          // console.log(this.curPosition);
          this.posStack.push(this.curPosition);
        },
        mousemoveCb: ({ x, y }) => {
          [tips.style.left, tips.style.top] = [x + 6 + "px", y - 10 + "px"];
        }
      });
      runPitchAnimation(map);
    },
    handleDrawPop() {
      this.posStack.pop();
    },
    handleDrawEnd() {
      this.showOverlapWrap = true;
      this.cancelFn && this.cancelFn();
      this.isDrawing = false;
      if (this.posStack.length < 3) {
        this.cancelDrawEnd();
      }
    },
    cancelDrawEnd() {
      let map = window.map;
      if (!map) return;
      map.remove(curPolyline);
      this.isOperating = false;
      // this.isDrawing = false;
      this.posStack = [];
      curPolyline = null;
      this.showOverlapWrap = false;
    },
    confirmDrawEnd() {
      let map = window.map;
      if (!map) return;
      if (this.posStack.length > 2) {
        let positions = [...this.posStack, this.posStack[0]];
        // let res = {
        //   positions,
        //   label: this.overlapConfig.label
        // }
        this.updateLog({
          id: uid++,
          time: getTime(),
          title: `${this.overlapConfig.label} *包围盒边界信息* ：`,
          content: JSON.stringify(positions)
        });
        const fromDegrees = AirlookMap.Cartographic.fromDegrees;
        curOverlap = new AirlookMap.OverlappingPolygons({
          positions: positions.map(v =>
            fromDegrees(v.longitude, v.latitude, v.height)
          ),
          color: "rgb(0,255,0)",
          opacity: 0.5,
          show: true
        });
        map.add(curOverlap);
        overlapList.push(curOverlap);
      }
      this.cancelDrawEnd();
    },
    clearLastOverlap() {
      if (!window.map) return;
      const map = window.map;
      map.remove(overlapList.pop());
    },
    darwLine(positions) {
      const map = window.map;
      const fromDegrees = AirlookMap.Cartographic.fromDegrees;
      positions = positions.map(v =>
        fromDegrees(v.longitude, v.latitude, v.height)
      );

      if (!curPolyline) {
        curPolyline = new AirlookMap.Polyline({
          positions,
          lineWidth: 2,
          color: "rgb(0,255,0)",
          dashed: false,
          depthTest: false
        });
        map.add(curPolyline);
        return;
      }
      curPolyline.positions = positions;
    },
    updateLog(log) {
      this.logList.push(log);
      const dom = this.$refs["log-list"];
      this.$nextTick(() => {
        const child = dom.children;
        if (child.length) {
          offsetY += child[child.length - 1].getClientRects()[0].height;
          // console.log(offsetY);
          dom.scrollTo(0, offsetY);
        }
      });
    },
    resetPitch() {
      const map = window.map;
      if (map && map.camera) {
        runPitchAnimation(map)
      }
    },
    clearAllMaker() {
      markerList.forEach(v => window.map && window.map.remove(v));
    },
    clearAllOverlap() {
      overlapList.forEach(v => window.map && window.map.remove(v));
    },
    mouseenter() {
      this.showTips = false;
    },
    mouseleave() {
      this.showTips = true;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrap {
  z-index: 2;
  .mouse-tips {
    word-break: keep-all;
    position: fixed;
    color: rgb(238, 236, 99);
    font-size: 12px;
    user-select: none;
  }
  .left-top {
    color: #fff;
    box-sizing: border-box;
    position: absolute;
    padding-top: 10px;
    padding-left: 10px;
    left: 0;
    top: 0;
  }
  .right-top {
    padding: 10px 4px;
    box-sizing: border-box;
    position: fixed;
    right: 0;
    top: 20vh;
    display: flex;
    width: 260px;
    background-color: rgba(255, 255, 255, 0.8);
    // overflow: auto;
    &.collapse {
      will-change: auto;
      transition: all 0.5s ease;
      &.collapsed {
        right: -260px;
      }
    }
    .open-close {
      cursor: pointer;
      text-align: center;
      left: -24px;
      position: absolute;
      display: block;
      width: 20px;
      padding: 2px;
      border-width: 1px;
      border-radius: 5px 0 0 5px;
      top: 0;
      background-color: #409eef;
      // font-size: 14px;
      color: #fff;
    }
    .flex-row {
      display: flex;
      flex-direction: row;
      &.flex-row-center {
        align-items: center;
        justify-content: center;
        margin-top: 14px;
        margin-bottom: 0;
      }
    }
    .flex-col {
      display: flex;
      flex-direction: column;
    }
    .flex-col-center {
      align-items: center;
      justify-content: center;
      margin-bottom: 0;
      &.bottom {
        margin-top: 6px;
      }
    }
    &.marker-config {
      word-break: keep-all;
      width: 350px;
      padding-left: 10px;
      .title {
        display: inline-block;
        margin-bottom: 8px;
      }
      .flex-row {
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;
        .label {
          font-size: 14px;
          display: inline-block;
          padding-top: 6px;
          width: 60px;
        }
        .input-wrap {
          display: flex;
          width: calc(100% - 60px);
        }
      }
      .near-far-scale {
        .title {
          font-size: 14px;
        }
        .flex-row {
          margin-bottom: 2px;
        }
        .label {
          padding-top: 8px;
          padding-right: 10px;
          font-size: 12px;
          &.right {
            padding-left: 4px;
          }
        }
      }
    }
    &.overlap-config {
      width: 280px;
      .flex-row {
        .label {
           width: 80px;
        }
        .input-wrap {
          width: calc(100% - 80px);
        }
      }
    }
  }
  .left-bottom {
    box-sizing: border-box;
    position: absolute;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    padding: 10px 0px 10px 20px;
    width: 360px;
    height: 250px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.8);
    .title {
      height: 22px;
      padding-right: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .el-button {
        font-size: 14px;
        color: #409;
      }
    }
    .log-list {
      width: 100%;
      overflow: auto;
      padding-top: 2px;
      .log {
        display: block;
        padding-right: 6px;
        margin-bottom: 5px;
        .time {
          font-size: 12px;
          color: #f20c0c;
        }
        .content {
          color: #000;
          word-break: break-all;
          font-size: 13px;
          .label {
            color: #f20c0c;
          }
        }
      }
    }
  }
  .tips {
    font-size: 14px;
    letter-spacing: 0.4px;
    line-height: 1.4;
    .el-button {
      padding: 0;
    }
    margin-bottom: 10px;
  }
}
.mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  text-align: center;
  .center {
    color: #fff;
    margin: auto;
  }
}
</style>

<style lang="scss">
.el-form-item .el-form-item__label {
  color: #fff;
}
.menu {
  .el-row {
    border: 1px dashed #fff;
    padding: 10px 0;
    text-align: center;
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .resetPitch span {
    font-size: 13px;
    letter-spacing: 0.4px;
    color: #409;
  }
}
</style>