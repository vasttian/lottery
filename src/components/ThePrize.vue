<template>
  <div class="v-prize" v-hotkey="keymap">
    <el-card shadow="hover" :body-style="{}">
      <div class="flex flex-col items-center card-content">
        <h3>幸运抽奖</h3>
        <span class="prize-image">
          <el-image
            v-if="currentPrize"
            :src="currentPrize"
            :preview-src-list="[currentPrize]"
          />
          <img v-else class="prize-preview" src="@/assets/default.png" />
        </span>
        <div class="prize-desc">{{ desc }}</div>
        <div class="flex items-center prize-name">
          <i class="el-icon-caret-left" @click="toPrev" />
          {{ currentItem.label }}
          <i class="el-icon-caret-right" @click="toNext" />
        </div>
        <el-button
          class="prize-btn"
          :disabled="!remain && !running"
          @click="onSubmit"
        >
          <span v-if="!remain && !running">已抽完</span>
          <span v-else>{{ running ? '停止' : '立即抽奖' }}</span>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  getLottery,
  conversionCategoryName,
  firstPrizeKey
} from '@/helper/index';

export default {
  name: 'ThePrize',
  props: {
    showRes: {
      type: Boolean,
      default: false
    },
    running: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentArrayIndex: 0,
      form: {
        category: '',
        mode: 0,
        qty: 1,
        allin: false
      },
      category: []
    };
  },
  computed: {
    ...mapState({
      storeNewLottery: state => state.newLottery,
      currentKey: state => state.currentKey,
      result: state => state.result,
      photos: state => state.photos
    }),
    keymap() {
      return {
        'ctrl+shift+up': this.toPrev,
        'ctrl+shift+left': this.toPrev,
        'ctrl+shift+right': this.toNext,
        'ctrl+shift+down': this.toNext,
        'ctrl+shift+enter': this.onSubmit
      };
    },
    categorys() {
      const options = [];
      Object.keys(this.config).forEach(key => {
        const index = this.storeNewLottery.findIndex(item => item.key === key);
        const item = this.config[key];
        if (Number(item) > 0) {
          let name = conversionCategoryName(key, this.config);
          if (name) {
            options.push({
              label: name,
              value: key,
              index: index + 1
            });
          }
        }
      });
      return options;
    },
    categorysIndexArray() {
      return this.categorys
        .map(item => item.index)
        .sort((a, b) => {
          return a - b;
        });
    },
    currentIndex() {
      return this.categorysIndexArray[this.currentArrayIndex];
    },
    currentItem() {
      return (
        this.categorys.find(item => item.index === this.currentIndex) || {}
      );
    },
    config() {
      return this.$store.state.config || {};
    },
    currentPrize() {
      if (!this.currentItem) {
        return '';
      }
      const id =
        this.currentItem.value === 'firstPrize'
          ? firstPrizeKey
          : this.currentItem.value;

      const item = this.photos.find(i => i.id === id);
      return item ? item.value : '';
    },
    desc() {
      const lottery = getLottery(this.currentItem.value);

      return this.currentItem.value === 'firstPrize'
        ? this.config.desc
        : lottery.desc || '';
    },
    remain() {
      return this.getRemain(this.currentItem.value);
    }
  },
  watch: {
    'storeNewLottery.length'() {
      this.currentArrayIndex += 1;
    },
    currentIndex() {
      this.$store.commit('setCurrentKey', this.currentItem.value);
    }
  },
  methods: {
    toPrev() {
      if (this.running) {
        return;
      }

      this.currentArrayIndex -= 1;
      if (this.currentArrayIndex < 0) {
        this.currentArrayIndex = this.categorysIndexArray.length - 1;
      }
    },
    toNext() {
      if (this.running) {
        return;
      }

      this.currentArrayIndex += 1;
      if (this.currentArrayIndex >= this.categorysIndexArray.length) {
        this.currentArrayIndex = 0;
      }
    },
    getRemain(category) {
      if (!this.config[category]) {
        return 0;
      }

      const count =
        this.config[category] -
        (this.result[category] ? this.result[category].length : 0);
      return count < 0 ? 0 : count;
    },
    onSubmit() {
      if (!this.running) {
        this.$emit('close-result');
      }

      if (!this.remain && !this.running) {
        return;
      }

      this.form.category = this.currentItem.value;
      if (!this.running && !this.form.category) {
        return this.$message.error('请选择本次抽取的奖项');
      }

      if (!this.running && this.remain <= 0) {
        return this.$message.error('该奖项剩余人数不足');
      }

      const { value } = this.currentItem;
      const { desc, key, name, needFilter } = this.config;
      const lottery =
        value === 'firstPrize'
          ? { desc, key, name, needFilter }
          : getLottery(value);

      this.form.needFilter = lottery.needFilter || false;
      console.log('>>>prize>>>this.form', this.form);
      setTimeout(
        () =>
          this.$emit(
            'toggle',
            Object.assign({}, this.form, { remain: this.remain })
          ),
        this.showRes ? 400 : 0
      );
    }
  },
  created() {
    this.$store.commit('setCurrentKey', this.currentItem.value);
  }
};
</script>
