<template>
  <div id="root">
    <header>
      <!-- <Publicity v-show="!running" /> -->
      <div style="width: 200px;">
        <el-button
          :disabled="running"
          class="res"
          @click="showResult = true"
          type="primary"
          icon="el-icon-finished"
          circle
        ></el-button>
        <!-- 播放背景音 -->
        <el-button
          class="audio"
          type="primary"
          circle
          :icon="audioPlaying ? 'el-icon-bell' : 'el-icon-message-solid'"
          @click="
            () => {
              playAudio(!audioPlaying);
            }
          "
        ></el-button>
        <el-button
          v-show="false"
          class="start"
          @click="startHandler"
          type="primary"
          size="mini"
        >
          {{ running ? '停止' : '开始' }}
        </el-button>
        <Tool
          ref="toolRef"
          class="con"
          :running="running"
          :closeRes="closeRes"
          @toggle="toggle"
          @resetConfig="reloadTagCanvas"
          @getPhoto="getPhoto"
          @show-config="showConfig = true"
          @reset-category="resetCategory"
        />
      </div>
    </header>
    <div id="main" :class="{ mask: showRes }"></div>

    <!-- 当前抽奖的奖项 -->
    <the-prize
      :category="category"
      :running="running"
      :show-res="showRes"
      :res-arr="resArr"
      @toggle="toggle"
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
            <img v-if="item.photo" :src="item.photo" :width="50" :height="50" />
          </a>
        </li>
      </ul>
    </div>

    <LotteryConfig
      @getPhoto="getPhoto"
      @resetconfig="reloadTagCanvas"
      :visible.sync="showConfig"
    />

    <!-- 抽奖接口汇总 -->
    <Result :visible.sync="showResult"></Result>
    <audio
      id="audiobg"
      preload="auto"
      controls
      autoplay
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
import LotteryConfig from '@/components/LotteryConfig';
// import Publicity from '@/components/Publicity';
import Tool from '@/components/Tool';
import VBounce from '@/components/VBounce';
import ThePrize from '@/components/ThePrize';
import bgaudio from '@/assets/bg.mp3';
// import beginaudio from '@/assets/begin.mp3';
import beginaudio from '@/assets/百石元 - 猪突猛進.mp3';
import {
  getData,
  configField,
  resultField,
  newLotteryField,
  listField
} from '@/helper/index';
import { lotteryHandler } from '@/helper/algorithm';
import Result from '@/components/Result';
import { database, DB_STORE_NAME } from '@/helper/db';
export default {
  name: 'App',
  components: {
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
      showResult: false,
      resArr: [],
      category: '',
      audioPlaying: false,
      audioSrc: bgaudio
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
      newLottery.forEach(item => {
        this.$store.commit('setNewLottery', item);
        if (!config[item.key]) {
          this.$set(config, item.key, 0);
        }
      });
      this.$store.commit('setConfig', config);
    }

    const list = getData(listField);
    if (list) {
      this.$store.commit('setList', list);
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
      canvas.width = document.body.offsetWidth;
      canvas.height = document.body.offsetHeight;
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
        const { category, mode, qty, remain, allin } = form;

        // 本次抽取人数
        let num = 1;
        if (mode === 1 || mode === 5) {
          num = mode;
        } else if (mode === 0) {
          num = remain;
        } else if (mode === 99) {
          num = qty;
        }

        const resArr = lotteryHandler(
          number,
          // eslint-disable-next-line
          allin ? [] : this.allresult,
          num
        );
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
    }
  }
};
</script>
<style lang="scss">
#root {
  height: 100%;
  position: relative;
  background-image: url('./assets/primary-vision-2.jpg');
  background-size: 100% 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #121936;
  .mask {
    -webkit-filter: blur(5px);
    filter: blur(5px);
  }
  header {
    justify-content: space-between;
    display: flex;
    position: absolute;
    width: 100%;
    height: 50px;
    bottom: 0;
    line-height: 50px;
    .con {
      bottom: 30px;
    }
    .el-button {
      position: absolute;
      z-index: 9999;
      &.res {
        left: 50px;
      }
    }
    .start {
      right: 20px;
      margin-top: 2px;
      background-color: #2941c0;
      border-color: #2941c0;
    }
    .audio {
      position: absolute;
      left: 90px;
    }
  }
  .bounce-enter-active {
    animation: bounce-in 1.5s;
  }
  .bounce-leave-active {
    animation: bounce-in 0s reverse;
  }
}
#main {
  height: 100%;
}

// .prize-preview {
//   position: absolute !important;
//   bottom: 0;
//   right: 0;
//   width: 200px;
//   height: 160px;
// }
</style>
