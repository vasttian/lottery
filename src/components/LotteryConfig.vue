<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    width="500px"
    @close="$emit('update:visible', false)"
    class="c-LotteryConfig"
  >
    <div class="c-LotteryConfigtitle" slot="title">
      <span :style="{ fontSize: '16px', marginRight: '20px' }">
        奖项配置
      </span>
      <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
        <el-button size="mini" @click="addLottery">增加奖项</el-button>
        <el-button size="mini" @click="$emit('update:visible', false)"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="onSubmit"
          >保存配置</el-button
        >
      </div>
      <!-- <small>目前这里的改动会立即生效</small> -->
    </div>
    <div class="container">
      <el-form ref="form" :model="form" size="mini">
        <el-form-item label="抽奖标题">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="抽奖总人数">
          <el-input
            type="number"
            v-model="form.number"
            :min="1"
            :step="1"
          ></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="一等奖（人数）">
          <el-input
            type="number"
            v-model="form.firstPrize"
            :min="0"
            :step="1"
          ></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item
          v-for="newitem in storeNewLottery"
          :key="newitem.key"
          :label="`${newitem.name}（人数）`"
        >
          <el-input
            type="number"
            :min="0"
            :step="1"
            v-model="form[newitem.key]"
            @change="
              val => {
                form[newitem.key] = Number(val);
              }
            "
          ></el-input>
          <el-switch
            v-model="newitem.needFilter"
            active-text="仅全职"
            inactive-text="全部"
            inactive-color="#dadfe4"
          ></el-switch>
          <div>
            <el-button type="text" @click="deleteLottery(newitem.key)">
              删除
            </el-button>
            <small v-if="!form[newitem.key] || form[newitem.key] <= 0">
              &nbsp;未设置或抽奖人数为 0 的奖项将不会在抽奖页显示
            </small>
          </div>
          <el-divider></el-divider>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog
      :visible.sync="showAddLottery"
      :append-to-body="true"
      width="480px"
    >
      <div class="add-title" slot="title">增加奖项</div>
      <el-form ref="newLottery" :model="newLottery" size="mini">
        <el-form-item label="奖项名称">
          <el-input v-model="newLottery.name"></el-input>
        </el-form-item>
        <el-form-item label="奖品描述">
          <el-input v-model="newLottery.desc"></el-input>
        </el-form-item>
        <el-form-item label="可抽此奖项">
          <el-switch
            v-model="newLottery.needFilter"
            active-text="仅全职"
            inactive-text="全部"
            inactive-color="#dadfe4"
          ></el-switch>
        </el-form-item>
        <el-form-item label="奖品图片" style="margin-top: 15px">
          <el-upload
            ref="uploadNewLotteryRef"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
          >
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <small style="margin-top: 10px;">
            如需更换奖品图片，请先删除原图片
          </small>
        </el-form-item>
      </el-form>
      <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
        <el-button size="mini" @click="closeNewLotteryDialog">取消</el-button>
        <el-button size="mini" type="primary" @click="addHandler"
          >增加奖项
        </el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { setData, configField } from '@/helper/index';
import { randomNum } from '@/helper/algorithm';
import { database, DB_STORE_NAME } from '@/helper/db';

export default {
  name: 'LotteryConfig',
  props: {
    visible: Boolean
  },
  computed: {
    form: {
      get() {
        return this.$store.state.config;
      },
      set(val) {
        // this.$store.commit('setConfig', val);
        return val;
      }
    },
    storeNewLottery() {
      return this.$store.state.newLottery;
    }
  },
  data() {
    return {
      showAddLottery: false,
      newLottery: {
        name: '',
        desc: '',
        needFilter: false
      }
    };
  },
  methods: {
    onSubmit() {
      setData(configField, this.form);
      this.$store.commit('setConfig', this.form);
      this.$store.commit('setLottery', this.storeNewLottery);
      this.$emit('update:visible', false);
      this.$message({
        message: '保存成功',
        type: 'success'
      });

      this.$nextTick(() => {
        this.$emit('resetconfig');
      });
    },
    addLottery() {
      this.showAddLottery = true;
    },
    deleteLottery(key) {
      this.$confirm('确认删除此奖项吗？删除后不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$store.commit('deleteLottery', key);
        })
        .catch(res => {
          console.log('deleteLottery>>>res>>>>>', res);
        });
    },
    randomField() {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      let fieldStr = '';
      for (let index = 0; index < 10; index++) {
        fieldStr += str.split('')[randomNum(1, 26) - 1];
      }
      return `${fieldStr}${Date.now()}`;
    },
    addHandler() {
      if (!this.newLottery.name) {
        return;
      }

      const field = this.randomField();
      const data = {
        key: field,
        name: this.newLottery.name,
        desc: this.newLottery.desc,
        needFilter: this.newLottery.needFilter
      };
      this.uploadImages(field);
      this.$store.commit('setNewLottery', [data, -1]);
      this.closeNewLotteryDialog();
    },
    closeNewLotteryDialog() {
      this.newLottery.desc = '';
      this.newLottery.name = '';
      this.newLottery.needFilter = false;
      this.$refs.uploadNewLotteryRef.clearFiles();
      this.showAddLottery = false;
    },
    uploadImages(id) {
      const files = this.$refs.uploadNewLotteryRef.uploadFiles;
      if (files[0]) {
        this.handleUnitImage(id, files[0]);
      }
    },
    handleUnitImage(id, file) {
      const formData = new FormData();
      formData.append('uploadImg', file);
      const reader = new FileReader();
      if (file) {
        this.filename = file.name;
        reader.readAsDataURL(file.raw);
        reader.onload = () => {
          this.saveHandler(id, reader.result);
        };
      }
    },
    async saveHandler(id, value) {
      if (!value) {
        return this.$message.error('请选择照片');
      }
      const Data = await database.get(DB_STORE_NAME, id);
      const param = {
        id,
        value
      };
      database[Data ? 'edit' : 'add'](
        DB_STORE_NAME,
        Data ? id : param,
        Data ? param : null
      )
        .then(res => {
          if (res) {
            this.$emit('getPhoto');
          } else {
            this.$message.error(`${this.filename}上传失败`);
          }
        })
        .catch(err => {
          this.$message.error(err.message);
        });
    }
  }
};
</script>
<style lang="scss">
.c-LotteryConfig {
  .el-dialog__body {
    height: 600px;
    .container {
      height: 100%;
      overflow-y: auto;
      padding: 0 10px;
    }
  }
}
</style>
