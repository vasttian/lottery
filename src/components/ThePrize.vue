<template>
  <div class="v-prize" v-hotkey="keymap">
    <el-card shadow="hover" :body-style="{}">
      <div class="flex flex-col gap-2 items-center">
        <h3>幸运抽奖</h3>
        <span class="prize-image">
          <el-image
            v-if="currentPrize"
            :src="currentPrize"
            :preview-src-list="[currentPrize]"
          />
          <img v-else class="prize-preview" src="@/assets/default.png" />
        </span>
        <h5>奖品：{{ desc }}</h5>
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
import { getLottery, conversionCategoryName } from '@/helper/index';

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
      currentIndex: 1,
      form: {
        category: '',
        mode: 0,
        qty: 1,
        allin: false
      }
    };
  },
  computed: {
    keymap() {
      return {
        'ctrl+shift+up': this.toPrev,
        'ctrl+shift+left': this.toPrev,
        'ctrl+shift+right': this.toNext,
        'ctrl+shift+down': this.toNext,
        'ctrl+shift+enter': this.onSubmit
      };
    },
    storeNewLottery() {
      return this.$store.state.newLottery;
    },
    categorys() {
      const options = [];
      Object.keys(this.config).forEach(key => {
        const item = this.config[key];
        if (Number(item) > 0) {
          let name = conversionCategoryName(key);
          if (name) {
            options.push({
              label: name,
              value: key,
              index: 1
            });
          }
        }
      });
      return options;
    },
    currentItem() {
      return this.categorys[this.currentIndex] || {};
    },
    config() {
      return this.$store.state.config || {};
    },
    result() {
      return this.$store.state.result;
    },
    photos() {
      return this.$store.state.photos;
    },
    currentPrize() {
      if (!this.currentItem) {
        return '';
      }

      const item = this.photos.find(i => i.id === this.currentItem.value);
      return item ? item.value : '';
    },
    desc() {
      const lottery = getLottery(this.currentItem.value);
      return lottery.desc || '';
    },
    remain() {
      const category = this.currentItem.value;
      if (!this.config[category]) {
        return 0;
      }

      const count =
        this.config[category] -
        (this.result[category] ? this.result[category].length : 0);
      return count < 0 ? 0 : count;
    }
  },
  watch: {
    'storeNewLottery.length'() {
      const newItem = this.storeNewLottery[0];
      console.log('>>>>>newItem>>', newItem);
      if (newItem && newItem.key) {
        const index = this.categorys.findIndex(c => c.value === newItem.key);
        console.log('>>>>>>>>index', index);
        if (index > -1) {
          this.currentIndex = index;
        }
      }
    }
  },
  methods: {
    toPrev() {
      this.currentIndex -= 1;
      if (this.currentIndex < 0) {
        this.currentIndex = this.categorys.length - 1;
      }
    },
    toNext() {
      this.currentIndex += 1;
      if (this.currentIndex >= this.categorys.length) {
        this.currentIndex = 0;
      }
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

      console.log('>>>>>>this.form', this.form);
      setTimeout(
        () =>
          this.$emit(
            'toggle',
            Object.assign({}, this.form, { remain: this.remain })
          ),
        this.showRes ? 600 : 0
      );
    }
  }
};
</script>
