<template>
  <div id="root" class="content">
    <header>
      <div class="flex justify-between">
        <!-- <span class="logo">
          <img src="./assets/logo-white.svg" alt="" />
        </span>
        <span class="slogan">
          <img src="./assets/slogan.svg" alt="" />
        </span> -->
      </div>
    </header>
    <div id="main" class="main" :class="{ mask: showRes }">
      <div
        class="pop-layout"
        :class="`prize-x-${running || showRes ? 'left' : 'center'}`"
      >
        <!-- 当前抽奖的奖项 -->
        <the-prize
          :category="category"
          :running="running"
          :show-res="showRes"
          :res-arr="resArr"
          @toggle="toggle"
          @close-result="showRes = false"
        />

        <!-- 当前的抽奖结果 -->
        <v-bounce
          :show-res="showRes"
          :res-arr="resArr"
          :category="category"
          @close="showRes = false"
        />

        <!-- 抽奖的 tag -->
        <div id="tags">
          <ul v-for="item in datas" :key="item.key">
            <li>
              <a
                href="javascript:void(0);"
                :style="{
                  color: '#fff'
                }"
              >
                {{ item.name ? item.name : item.key }}
                <img
                  v-if="item.photo"
                  :src="item.photo"
                  :width="50"
                  :height="50"
                />
              </a>
            </li>
          </ul>
        </div>

        <SystemConfig :visible.sync="showSysConfig" />

        <LotteryConfig
          @getPhoto="getPhoto"
          @resetconfig="reloadTagCanvas"
          :visible.sync="showConfig"
        />

        <!-- 抽奖接口汇总 -->
        <Result :visible.sync="showResult"></Result>
      </div>
    </div>

    <div class="footer">
      <!-- <Publicity v-show="!running" /> -->
      <Tool
        ref="toolRef"
        :running="running"
        :closeRes="closeRes"
        @toggle="toggle"
        @resetConfig="reloadTagCanvas"
        @getPhoto="getPhoto"
        @show-config="showConfig = true"
        @show-sys-config="showSysConfig = true"
        @reset-category="resetCategory"
      />
      <el-button
        :disabled="running"
        class="res el-button__white"
        @click="showResult = true"
        type="text"
        icon="el-icon-finished"
        circle
      />
      <!-- 播放背景音 -->
      <el-button
        class="audio el-button__white"
        type="text"
        circle
        :icon="audioPlaying ? 'el-icon-bell' : 'el-icon-message-solid'"
        @click="
          () => {
            playAudio(!audioPlaying);
          }
        "
      />
      <el-button
        style="left: 140px;"
        class="el-button__white"
        @click="adding = true"
        type="text"
        icon="el-icon-plus"
        circle
      />
      <template v-if="adding">
        <div class="adding">
          <el-input-number size="small" v-model="inputNum" />
          <el-button type="primary" size="small" @click="addLotteryHandler">
            确定
          </el-button>
        </div>
      </template>
      <el-button
        v-show="false"
        class="start"
        @click="startHandler"
        type="primary"
        size="mini"
      >
        {{ running ? '停止' : '开始' }}
      </el-button>
    </div>

    <audio
      id="audiobg"
      preload="auto"
      controls
      autoplay
      class="hidden"
      loop
      @play="playHandler"
      @pause="pauseHandler"
    >
      <source :src="audioSrc" />
      你的浏览器不支持 audio 标签
    </audio>
  </div>
</template>

<script>
import SystemConfig from './components/SystemConfig';
import LotteryConfig from '@/components/LotteryConfig';
// import Publicity from '@/components/Publicity';
import Tool from '@/components/Tool';
import VBounce from '@/components/VBounce';
import ThePrize from '@/components/ThePrize';
import bgaudio from '@/assets/bg.mp3';
// import beginaudio from '@/assets/begin.mp3';
import beginaudio from '@/assets/百石元 - 猪突猛進.mp3';
import {
  setData,
  getData,
  systemConfigField,
  configField,
  resultField,
  newLotteryField,
  listField
} from '@/helper/index';
import { lotteryHandler, randomNum } from '@/helper/algorithm';
import Result from '@/components/Result';
import { database, DB_STORE_NAME } from '@/helper/db';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    SystemConfig,
    LotteryConfig,
    Tool,
    VBounce,
    Result,
    ThePrize
  },
  data() {
    return {
      running: false,
      showRes: false,
      showConfig: false,
      showSysConfig: false,
      showResult: false,
      resArr: [],
      category: '',
      audioPlaying: false,
      audioSrc: bgaudio,
      adding: false,
      num: 0,
      inputNum: 1
    };
  },
  watch: {
    photos: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      }
    }
  },
  computed: {
    ...mapState({
      storeNewLottery: state => state.newLottery,
      currentKey: state => state.currentKey,
      allowRepeatJoin: state => state.systemConfig.allowRepeatJoin
    }),
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    result: {
      get() {
        return this.$store.state.result;
      },
      set(val) {
        this.$store.commit('setResult', val);
      }
    },
    list() {
      return this.$store.state.list;
    },
    allresult() {
      let allresult = [];
      for (const key in this.result) {
        if (this.result.hasOwnProperty(key)) {
          const element = this.result[key];
          allresult = allresult.concat(element);
        }
      }
      return allresult;
    },

    // 当数量过大时，随机挑选一些名单滚动
    datas() {
      const { number } = this.config;
      const nums = number >= 1500 ? 500 : this.config.number;
      const configNum = number > 1500 ? Math.floor(number / 3) : number;
      const randomShowNums = lotteryHandler(configNum, [], nums);
      const randomShowDatas = randomShowNums.map(item => {
        const listData = this.list.find(d => d.key === item);
        const photo = this.photos.find(d => d.id === item);
        return {
          key: item * (number > 1500 ? 3 : 1),
          name: listData ? listData.name : '',
          photo: photo ? photo.value : ''
        };
      });
      return randomShowDatas;
    },
    photos() {
      return this.$store.state.photos;
    },
    currentPrize() {
      if (!this.category) {
        return '';
      }

      // const key = `${this.category}__prize`;
      const item = this.photos.find(i => i.id === this.category);
      return item ? item.value : '';
    },
    form: {
      get() {
        return this.$store.state.config;
      },
      set(val) {
        // this.$store.commit('setConfig', val);
        return val;
      }
    }
  },
  created() {
    const data = getData(configField);
    if (data) {
      this.$store.commit('setConfig', Object.assign({}, data));
    }

    const result = getData(resultField);
    if (result) {
      this.$store.commit('setResult', result);
    }

    const newLottery = getData(newLotteryField);
    if (newLottery) {
      const config = this.config;
      for (let i = newLottery.length - 1; i >= 0; i--) {
        const item = newLottery[i];
        this.$store.commit('setNewLottery', [item, -1]);
        if (!config[item.key]) {
          this.$set(config, item.key, 0);
        }
      }
      this.$store.commit('setConfig', config);
    }

    const list = getData(listField);
    if (list) {
      this.$store.commit('setList', list);
    }

    const systemConfig = getData(systemConfigField);
    if (systemConfig) {
      this.$store.commit('setSysConfig', systemConfig);
    }
  },
  mounted() {
    this.startTagCanvas();
    setTimeout(() => {
      this.getPhoto();
    }, 1000);
    window.addEventListener('resize', this.reportWindowSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.reportWindowSize);
  },
  methods: {
    resetCategory() {
      this.category = '';
    },
    startHandler() {
      this.toggle();
      this.$refs.toolRef.startHandler();
    },
    reportWindowSize() {
      const AppCanvas = this.$el.querySelector('#rootcanvas');
      if (AppCanvas.parentElement) {
        AppCanvas.parentElement.removeChild(AppCanvas);
      }

      this.startTagCanvas();
    },
    playHandler() {
      this.audioPlaying = true;
    },
    pauseHandler() {
      this.audioPlaying = false;
    },
    playAudio(type) {
      if (type) {
        this.$el.querySelector('#audiobg').play();
      } else {
        this.$el.querySelector('#audiobg').pause();
      }
    },
    loadAudio() {
      this.$el.querySelector('#audiobg').load();
      this.$nextTick(() => {
        this.$el.querySelector('#audiobg').play();
      });
    },
    getPhoto() {
      database.getAll(DB_STORE_NAME).then(res => {
        if (res && res.length) {
          this.$store.commit('setPhotos', res);
        }
      });
    },
    speed() {
      return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)];
    },
    createCanvas() {
      const canvas = document.createElement('canvas');
      // canvas.width = document.body.offsetWidth - 200;
      canvas.width = document.body.offsetWidth;
      canvas.height = document.body.offsetHeight;
      // canvas.width = 2000;
      // canvas.height = 450;
      // console.log('>>>canvas body', document.body.offsetWidth, document.body.offsetHeight);
      // console.log('>>>canvas', canvas.width, canvas.height);
      canvas.id = 'rootcanvas';
      this.$el.querySelector('#main').appendChild(canvas);
    },
    startTagCanvas() {
      this.createCanvas();
      const { speed } = this;
      window.TagCanvas.Start('rootcanvas', 'tags', {
        textColour: null,
        initial: speed(),
        dragControl: 1,
        textHeight: 20,
        noSelect: true,
        lock: 'xy'
      });
    },
    reloadTagCanvas() {
      window.TagCanvas.Reload('rootcanvas');
    },
    closeRes() {
      this.showRes = false;
    },
    toggle(form) {
      const { speed, config } = this;
      if (this.running) {
        this.audioSrc = bgaudio;
        this.loadAudio();

        window.TagCanvas.SetSpeed('rootcanvas', speed());
        this.showRes = true;
        this.running = !this.running;
        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      } else {
        this.showRes = false;
        if (!form) {
          return;
        }

        this.audioSrc = beginaudio;
        this.loadAudio();

        const { number } = config;
        const { category, mode, qty, remain, allin, needFilter } = form;

        // 本次抽取人数
        let num = 1;
        if (mode === 1 || mode === 5) {
          num = mode;
        } else if (mode === 0) {
          num = remain;
        } else if (mode === 99) {
          num = qty;
        }

        let wins = this.allowRepeatJoin || allin ? [] : this.allresult;
        if (needFilter) {
          // 如果需要过滤，这里将所有 i.type !== 'Permanent' 的名单放入 wins，避免抽中
          this.photos.forEach(i => {
            if (i.type !== 'Permanent') {
              wins.push(i.id);
            }
          });
        }

        const resArr = lotteryHandler(number, wins, num);
        this.resArr = resArr;

        this.category = category;
        if (!this.result[category]) {
          this.$set(this.result, category, []);
        }

        const oldRes = this.result[category] || [];
        const data = Object.assign({}, this.result, {
          [category]: oldRes.concat(resArr)
        });

        this.result = data;
        window.TagCanvas.SetSpeed('rootcanvas', [5, 1]);
        this.running = !this.running;
      }
    },
    randomField() {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      let fieldStr = '';
      for (let index = 0; index < 10; index++) {
        fieldStr += str.split('')[randomNum(1, 26) - 1];
      }
      return `${fieldStr}${Date.now()}`;
    },
    addLotteryHandler() {
      this.adding = false;
      const field = this.randomField();
      const newLottery = {
        key: field,
        name: '赞助奖',
        needFilter: true,
        desc: ''
      };
      const currentIndex = this.storeNewLottery.length
        ? this.storeNewLottery.findIndex(item => item.key === this.currentKey)
        : 0;
      if (this.num > 0) {
        newLottery.name = `赞助奖-${this.num}`;
      }
      this.num += 1;
      this.$store.commit('setNewLottery', [newLottery, currentIndex]);
      this.form[field] = this.inputNum;
      this.inputNum = 1;
      setData(configField, this.form);
      this.$store.commit('setConfig', this.form);
      // this.$nextTick(() => {
      //   this.reloadTagCanvas();
      // });
    }
  }
};
</script>
