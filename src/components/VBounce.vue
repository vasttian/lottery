<template>
  <transition name="el-zoom-in-bottom">
    <el-card
      id="resbox"
      class="prize-result"
      v-show="showRes"
      v-hotkey="keyBounce"
    >
      <h3 @click="close">{{ categoryName }}获得者，恭喜 ！</h3>
      <div class="grid gap-12 grid-cols-4 p-6">
        <span
          v-for="item in resArr"
          :key="item"
          class="itemres"
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
            <span v-if="!!list.find(d => d.key === item)">
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
    }
  },
  methods: {
    close() {
      this.$emit('close');
    }
  }
};
</script>
