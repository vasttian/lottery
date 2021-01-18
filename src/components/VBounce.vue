<template>
  <transition name="bounce">
    <div id="resbox" v-show="showRes">
      <p @click="showRes = false">{{ categoryName }}</p>
      <div class="container">
        <span
          v-for="item in resArr"
          :key="item"
          class="itemres"
          :style="resCardStyle"
          :data-id="item"
          @click="showRes = false"
        >
          <template v-if="photos.find(d => d.id === item)">
            <img
              :src="photos.find(d => d.id === item).value"
              :width="160"
              :height="160"
              alt="photo"
            />
            <span class="re-image-label">
              {{ photos.find(d => d.id === item).name }}
            </span>
          </template>
          <span v-else class="cont">
            <span
              v-if="!!list.find(d => d.key === item)"
              :style="{
                fontSize: '40px'
              }"
            >
              {{ list.find(d => d.key === item).name }}
            </span>
            <span v-else>
              {{ item }}
            </span>
          </span>
        </span>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  conversionCategoryName,
} from '@/helper/index';

export default {
  name: 'VBounce',
  props: {
    resArr: {
      type: Array,
      default: () => []
    },
    category: {
      type: String,
      default: ''
    },
    showRes: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  computed: {
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    photos() {
      return this.$store.state.photos;
    },
    list() {
      return this.$store.state.list;
    },
    categoryName() {
      return conversionCategoryName(this.category);
    },
    resCardStyle() {
      const style = { fontSize: '30px' };
      const { number } = this.config;
      if (number < 100) {
        style.fontSize = '100px';
      } else if (number < 1000) {
        style.fontSize = '80px';
      } else if (number < 10000) {
        style.fontSize = '60px';
      }

      style.marginRight = this.resArr.length > 1 ? '20px' : 0;
      return style;
    },
  },
};
</script>

<style lang="scss">
#resbox {
  position: absolute;
  border: 2px solid blue;
  background-color: #06176a7a;
  // height: 100%;
  max-height: 100%;
  overflow: auto;
  top: 50%;
  left: 80%;
  width: 1000px;
  transform: translateX(-80%) translateY(-50%);
  text-align: center;
  p {
    color: white;
    font-size: 50px;
    line-height: 120px;
    font-weight: 500;
  }
  .container {
    // height: 80%;
    // overflow: auto;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
  .itemres {
    background: #fff;
    width: 160px;
    height: 160px;
    border-radius: 4px;
    border: 1px solid #ccc;
    line-height: 160px;
    font-weight: bold;
    // margin-right: 20px;
    margin-bottom: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    .cont {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    &.numberOver::before {
      content: attr(data-id);
      width: 30px;
      height: 22px;
      line-height: 22px;
      background-color: #fff;
      position: absolute;
      bottom: 0;
      left: 0;
      font-size: 14px;
      // border-radius: 50%;
      z-index: 1;
    }
    .re-image-label {
      font-size: 24px;
      line-height: 24px;
      color: #f5f7fa;
      position: absolute;
      bottom: -28px;
    }
  }
}
</style>