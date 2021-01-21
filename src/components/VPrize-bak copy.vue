<template>
  <div class="v-prize">
    <el-card
      v-if="category && config[category]"
      shadow="hover"
      :style="{ height: cardHeight }"
      :body-style="{ padding: 0, 'background-color': '#0c0c4c' }"
    >
      <div class="card-label">
        <span class="prize">{{ categoryName }}</span>
        <span class="count">{{ remain }}/{{ config[category] }}</span>
      </div>
      <div class="title">
        {{ desc }}
      </div>
      <el-image
        v-if="currentPrize"
        class="prize-preview"
        :src="currentPrize"
        :preview-src-list="[currentPrize]"
      />
      <!-- <img :src="currentPrize" class="image"> -->
    </el-card>
  </div>
</template>

<script>
import { getLottery } from '@/helper/index';
export default {
  name: 'VPrize',
  props: {
    category: {
      type: String,
      default: ''
    },
    categoryName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {
    cardHeight() {
      let height = this.currentPrize ? 354 : 100;
      if (!this.desc) {
        height -= 38;
      }

      return `${height}px`;
    },
    config() {
      return this.$store.state.config || {};
    },
    remain() {
      if (!this.config[this.category]) {
        return 0;
      }

      const count =
        this.config[this.category] -
        (this.result[this.category] ? this.result[this.category].length : 0);
      return count < 0 ? 0 : count;
    },
    result() {
      return this.$store.state.result;
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
    desc() {
      const lottery = getLottery(this.category);
      return lottery.desc || '';
    }
  }
};
</script>

<style lang="scss">
// .v-prize {
//   position: absolute;
//   top: 100px;
//   left: 20px;
//   .el-card {
//     width: 252px;
//     height: 342px;
//     border: 2px solid #1a9fe8;
//   }
//   .card-label {
//     padding: 10px 12px 10px 12px;
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     color: white;
//     .prize {
//       font-size: 32px;
//       font-weight: 600;
//     }
//     .count {
//       font-size: 18px;
//     }
//   }
//   .title {
//     color: white;
//     font-size: 22px;
//     font-weight: 300;
//     padding: 0 0 8px 12px;
//   }
//   .prize-preview {
//     margin-bottom: -5px;
//     width: 252px;
//     height: 252px;
//   }
// }

// .el-image-viewer__btn.el-image-viewer__close {
//   color: white;
// }
</style>
