<template>
  <transition name="bounce">
    <el-card
      id="resbox"
      class="prize-result"
      v-show="showRes"
      v-hotkey="keyBounce"
    >
      <h3 @click="close">{{ categoryName }} 获得者，恭喜 ！</h3>
      <div class="grid gap-16 grid-cols-4 p-6">
        <span
          v-for="item in resArr"
          :key="item"
          class="itemres"
          :style="resCardStyle"
          :data-id="item"
          @click="close"
        >
          <template v-if="photos.find(d => d.id === item)">
            <img
              :src="photos.find(d => d.id === item).value"
              :width="160"
              :height="160"
              alt="photo"
            />
            <span class="name">
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
    </el-card>
  </transition>
</template>

<script>
import { conversionCategoryName } from '@/helper/index';

export default {
  name: 'VBounce',
  props: {
    showRes: {
      type: Boolean,
      default: false
    },
    resArr: {
      type: Array,
      default: () => []
    },
    category: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {
    keyBounce() {
      return { 'ctrl+shift+m': this.close };
    },
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
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>
