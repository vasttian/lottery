<template>
  <div
    class="v-prize"
    :class="`prize-x-${running || showRes ? 'left' : 'center'}`"
    v-hotkey="keymap"
  >
    <el-card
      shadow="hover"
      :body-style="{ padding: 0, 'background-color': '#0c0c4c' }"
    >
      <div class="card-items">
        <div class="prize">幸运抽奖</div>
        <el-image
          v-if="currentPrize"
          class="prize-preview"
          :src="currentPrize"
          :preview-src-list="[currentPrize]"
        />
        <img v-else class="prize-preview" src="@/assets/yimian.png" />
        <span class="title">{{ desc }}</span>
        <div class="prize">
          <i class="el-icon-caret-left" @click="toPrev" />
          {{ currentItem.label }}
          <i class="el-icon-caret-right" @click="toNext" />
        </div>
        <div>
          <!-- <span class="count">{{ remain }}/{{ config[category] }}</span> -->
        </div>
        <el-button
          style="width: 200px; background-color: pink;"
          @click="onSubmit"
        >
          {{ running ? '停止' : '立即抽奖' }}
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
        'ctrl+up': this.toPrev,
        'ctrl+left': this.toPrev,
        'ctrl+right': this.toNext,
        'ctrl+down': this.toNext,
        'ctrl+enter': this.onSubmit
      };
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
              value: key
            });
          }
        }
      });
      return options;
    },
    currentItem() {
      return this.categorys[this.currentIndex];
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
      this.form.category = this.currentItem.value;
      if (!this.form.category) {
        return this.$message.error('请选择本次抽取的奖项');
      }

      console.log('>>>>>>this.form', this.form);
      this.$emit(
        'toggle',
        Object.assign({}, this.form, { remain: this.remain })
      );
    }
  }
};
</script>

<style lang="scss">
.prize-x-center {
  left: 0;
  right: 0;
}
.prize-x-left {
  left: 20px;
}
.v-prize {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 400px;
  height: 500px;
  .el-card {
    border: 2px solid #1a9fe8;
    flex-wrap: wrap;
  }
  .card-items {
    padding: 10px 12px 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    flex-direction: column;
    flex-wrap: wrap;

    img {
      width: 160px;
      height: 160px;
    }
    .prize {
      font-size: 32px;
      font-weight: 600;
    }
    .count {
      font-size: 18px;
    }
  }
  .title {
    color: white;
    font-size: 22px;
    font-weight: 300;
    padding: 0 0 8px 12px;
  }
  .prize-preview {
    width: 200px;
    height: 200px;
  }
}

.el-image-viewer__btn.el-image-viewer__close {
  color: white;
}
</style>
