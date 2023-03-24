<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    width="500px"
    @close="$emit('update:visible', false)"
  >
    <div class="c-LotteryConfigtitle" slot="title">
      <span :style="{ fontSize: '16px', marginRight: '20px' }">
        系统配置
      </span>
      <div style="margin-top: 10px; display: flex; justify-content: flex-end;">
        <el-button size="mini" @click="close">取消</el-button>
        <el-button size="mini" type="primary" @click="onSubmit"
          >保存配置</el-button
        >
      </div>
    </div>
    <div class="container">
      <el-form ref="formRef" :model="form" size="mini">
        <el-form-item prop="allowRepeatJoin" label="允许重复参与复抽奖">
          <el-switch v-model="form.allowRepeatJoin"></el-switch>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'SystemConfig',
  props: {
    visible: Boolean
  },
  computed: {
    form: {
      get() {
        return this.$store.state.systemConfig;
      },
      set(val) {
        // this.$store.commit('setConfig', val);
        return val;
      }
    }
  },
  methods: {
    onSubmit() {
      this.$store.commit('setSysConfig', this.form);
      this.$emit('update:visible', false);
      this.$message({
        message: '保存成功',
        type: 'success'
      });

      this.$nextTick(() => {
        this.$emit('resetconfig');
      });
    },
    close() {
      this.$refs.formRef.resetFields();
      this.$emit('update:visible', false);
    }
  }
};
</script>
