<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    width="600px"
    class="c-Result"
    :append-to-body="true"
  >
    <div class="dialog-title" slot="title">
      <span :style="{ fontSize: '18px' }">
        抽奖结果
      </span>
      <span :style="{ fontSize: '14px', color: '#999', marginLeft: '10px' }">
        (点击号码可以删除)
      </span>
    </div>
    <div
      v-for="(item, index) in resultList"
      :key="index"
      class="listrow"
      @click="
        event => {
          deleteRes(event, item);
        }
      "
    >
      <span class="name">
        {{ item.name }}
      </span>
      <div class="value">
        <span v-if="item.value && !item.value.length">
          暂未抽奖
        </span>
        <!-- <span
          class="card"
          v-for="(data, j) in item.value"
          :key="j"
          :data-res="data"
        >
          {{ data }}
        </span> -->
        <span
          v-for="(item, idx) in item.value"
          :key="`sub-${idx}`"
          class="itemres card"
          :style="resCardStyle"
          :data-res="item"
        >
          <!-- 图片不展示编号，可以把这个 class 整个删除 -->
          <!-- :class="{
            numberOver:
              !!photos.find(d => d.id === item) ||
              !!list.find(d => d.key === item)
          }" -->
          <template v-if="photos.find(d => d.id === item)">
            <img
              alt="photo"
              :src="photos.find(d => d.id === item).value"
              :width="120"
              :height="120"
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
  </el-dialog>
</template>
<script>
import { conversionCategoryName, getDomData } from '@/helper/index';
export default {
  name: 'c-Result',
  props: {
    visible: Boolean
  },
  computed: {
    result: {
      get() {
        return this.$store.state.result;
      },
      set(val) {
        this.$store.commit('setResult', val);
      }
    },
    resultList() {
      const list = [];
      Object.keys(this.result).forEach(key => {
        const element = this.result[key];
        let name = conversionCategoryName(key);
        if (key) {
          list.push({
            label: key,
            name,
            value: element
          });
        }
      });
      return list;
    },
    list() {
      return this.$store.state.list;
    },
    photos() {
      return this.$store.state.photos;
    },
    resCardStyle() {
      const style = { fontSize: '20px' };
      style.marginRight = '10px';
      return style;
    }
  },
  methods: {
    deleteRes(event, row) {
      const Index = getDomData(event.target, 'res');
      if (!Index) {
        const result = this.result;
        const labels = this.result[row.label];
        if (labels) {
          const idx = labels.findIndex(i => i === null);
          if (idx > -1) {
            result[row.label].splice(idx, 1);
            this.result = result;
          }
        }

        return;
      }
      this.$confirm('此操作将移除该中奖号码，确认删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (Index) {
            const result = this.result;
            result[row.label] = this.result[row.label].filter(
              item => item !== Number(Index)
            );
            this.result = result;
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    }
  }
};
</script>
<style lang="scss">
.c-Result {
  .el-dialog__body {
    max-height: 500px;
    overflow-y: auto;
  }
  .listrow {
    display: flex;
    line-height: 30px;
    .name {
      width: 80px;
      font-weight: bold;
    }
    .value {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
    }
    .card {
      display: inline-block;
      // width: 40px;
      line-height: 30px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: #f2f2f2;
      margin-left: 5px;
      margin-bottom: 5px;
      position: relative;
      cursor: pointer;
      &:hover {
        &::after {
          content: '删除';
          width: 100%;
          height: 100%;
          background-color: #ccc;
          position: absolute;
          left: 0;
          top: 0;
          color: red;
        }
      }
    }

    .itemres {
      background: #fff;
      width: 120px;
      height: 120px;
      border-radius: 4px;
      border: 1px solid #ccc;
      line-height: 120px;
      font-weight: bold;
      // margin-right: 20px;
      margin-bottom: 30px;
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
        content: attr(data-res);
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
        font-size: 18px;
        line-height: 18px;
        color: #606367;
        position: absolute;
        bottom: -22px;
      }
    }
  }
}
</style>
