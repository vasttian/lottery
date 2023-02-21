<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    width="680px"
    @close="$emit('update:visible', false)"
    class="c-bulkImportphoto"
    custom-class="c-dialog"
  >
    <el-row>
      <el-upload
        ref="upload"
        list-type="picture-card"
        multiple
        action="#"
        :auto-upload="false"
        :on-preview="handlePictureCardPreview"
        :file-list="fileList"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :modal="false" :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-row>
    <el-row>
      <p>
        支持 jpg 和 png，大小不能超过 150kb，建议 20-50kb，建议尺寸 160 * 160px;
        <br />
        <span style="color:red">图片须命名为：ID-姓名.png</span>
        <br />
        如：1-田益铭.png
      </p>
    </el-row>
    <el-row v-if="filename">正在上传：{{ filename }}</el-row>
    <el-row v-if="errorImages && errorImages.length">
      这些图片文件存在错误：{{ errorImages }}
    </el-row>
    <el-row class="center">
      <el-button size="mini" @click="closeDialog">
        取消
      </el-button>
      <el-button size="mini" type="primary" @click="uploadImages">
        上传
      </el-button>
    </el-row>
  </el-dialog>
</template>
<script>
import { database, DB_STORE_NAME } from '@/helper/db';
import { splitFileName } from '@/helper/index';

export default {
  name: 'BulkImportphoto',
  props: {
    visible: Boolean
  },
  computed: {
    config: {
      get() {
        return this.$store.state.config;
      }
    }
  },
  data() {
    return {
      filename: '',
      dialogImageUrl: '',
      dialogVisible: false,
      fileList: [],
      errorImages: [],
      filesLen: 0,
      count: 0
    };
  },
  methods: {
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    closeDialog() {
      this.$refs.upload.clearFiles();
      this.errorImages = [];
      // this.$refs.upload.uploadFiles = [];
      this.$emit('update:visible', false);
      this.filename = '';
    },
    uploadImages() {
      this.errorImages = [];
      this.count = 0;
      // console.log('>>>>>>>>this.$refs.upload', this.$refs.upload.uploadFiles);
      const files = this.$refs.upload.uploadFiles;
      this.filesLen = files.length;
      for (let i = 0, len = this.filesLen; i < len; i += 1) {
        const file = files[i];
        const items = splitFileName(file.name).split('-');
        this.filename = '';
        if (items.length < 2) {
          this.errorImages.push(file.name);
        } else {
          this.handleUnitImage(items, file);
        }
      }

      this.$emit('getPhoto');
      setTimeout(() => {
        if (!this.errorImages.length) {
          this.$message({
            message: '图片全部上传成功',
            type: 'success'
          });
          this.closeDialog();
        }
      }, 1000);
    },
    handleUnitImage(items, file) {
      const formData = new FormData();
      formData.append('uploadImg', file);
      const reader = new FileReader();
      const AllowImgFileSize = 150; // KB
      const fileSize = file.size / 1024;
      if (file) {
        this.filename = file.name;
        reader.readAsDataURL(file.raw);
        reader.onload = () => {
          if (AllowImgFileSize && AllowImgFileSize < fileSize) {
            this.errorImages.push(this.filename);
            return this.$message.error('不允许上传大于 150KB 的图片');
          } else {
            const value = reader.result;
            this.saveHandler(items, value);
          }
        };
      }
    },
    async saveHandler(items, value) {
      const ID = Number(items[0]);

      if (!ID || ID <= 0) {
        return this.$message.error('ID 须为大于 0 的整数');
      }

      if (!value) {
        return this.$message.error('请选择照片');
      }

      const Data = await database.get(DB_STORE_NAME, ID);
      const name = items[1];
      const param = {
        id: ID,
        name,
        type:
          name.includes('（实习）') || name.includes('（实习生）')
            ? 'Intern'
            : 'Permanent',
        value
      };

      database[Data ? 'edit' : 'add'](
        DB_STORE_NAME,
        Data ? ID : param,
        Data ? param : null
      )
        .then(res => {
          this.count += 1;
          if (this.count >= this.filesLen) {
            this.$emit('getPhoto');
          }
          if (!res) {
            this.$message.error(`${this.filename}上传失败`);
            this.errorImages.push(this.filename);
          }
        })
        .catch(err => {
          this.errorImages.push(this.filename);
          this.$message.error(err.message);
        });
    }
  }
};
</script>
<style lang="scss">
.c-bulkImportphoto {
  .c-dialog {
    max-height: 100%;
    overflow: auto;
  }
  label {
    margin-right: 20px;
    vertical-align: top;
  }
  .el-input {
    width: 140px;
  }
  .el-row {
    padding: 5px 0;
  }
  .center {
    text-align: center;
  }
}
</style>
