import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  systemConfigField,
  resultField,
  newLotteryField,
  listField,
  firstPrizeKey
} from '@/helper/index';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    systemConfig: {
      allowRepeatJoin: false
    },
    config: {
      subject: '一面数据年会',
      number: 50,
      firstPrize: 1,
      name: '一等奖',
      desc: '',
      needFilter: false,
      key: firstPrizeKey
    },
    result: {
      firstPrize: []
    },
    newLottery: [],
    list: [],
    photos: [],
    resetKeys: 0,
    currentKey: 'firstPrize'
  },
  mutations: {
    setClearConfig(state) {
      state.config = {
        name: '一等奖',
        number: 50,
        firstPrize: 1,
        desc: '',
        needFilter: false,
        key: firstPrizeKey
      };
      state.newLottery = [];
    },
    setClearList(state) {
      state.list = [];
    },
    resetOldPrizeKeys(state) {
      state.resetKeys += 1;
    },
    setClearPhotos(state) {
      state.photos = [];
    },
    setClearResult(state) {
      state.result = {
        firstPrize: []
      };
    },
    setClearSysConfig(state) {
      state.systemConfig = {
        allowRepeatJoin: false
      };
    },
    setClearStore(state) {
      state.systemConfig = {
        allowRepeatJoin: false
      };
      state.config = {
        name: '一等奖',
        number: 50,
        firstPrize: 1,
        desc: '',
        needFilter: false,
        key: firstPrizeKey
      };
      state.result = {
        firstPrize: []
      };
      state.newLottery = [];
      state.list = [];
      state.photos = [];
    },
    setSysConfig(state, config) {
      state.systemConfig = Object.assign({}, config);
      setData(systemConfigField, state.systemConfig);
    },
    setConfig(state, config) {
      state.config = Object.assign({}, config);
    },
    setResult(state, result = {}) {
      state.result = result;
      setData(resultField, state.result);
    },
    setLottery(state, newLottery) {
      setData(newLotteryField, newLottery);
    },
    setNewLottery(state, [newLottery, index = 0]) {
      if (state.newLottery.find(item => item.key === newLottery.key)) {
        return;
      }
      // 在开头添加新奖项
      // 赞助奖添加当前页面奖项后面
      state.newLottery.splice(Math.max(index + 1, 0), 0, newLottery);
      setData(newLotteryField, state.newLottery);
    },
    deleteLottery(state, key) {
      // const index = state.newLottery.findIndex(i => i.key === key);
      // state.newLottery.splice(index, 1);
      state.newLottery = state.newLottery.filter(i => i.key !== key);
      setData(newLotteryField, state.newLottery);
      state.config[key] = 0;
      state.result[key] = [];
      delete state.config[key];
      delete state.result[key];
      setData(resultField, state.result);
    },
    updateLottery(state, data) {
      const index = state.newLottery.findIndex(i => i.key === data.key);
      state.newLottery.splice(index, 1, data);
      setData(newLotteryField, state.newLottery);
    },
    updateAllLottery(state, newLottery) {
      state.newLottery = newLottery;
      setData(newLotteryField, state.newLottery);
    },
    setList(state, list) {
      const arr = state.list;
      list.forEach(item => {
        const arrIndex = arr.findIndex(data => data.key === item.key);
        if (arrIndex > -1) {
          arr[arrIndex].name = item.name;
        } else {
          arr.push(item);
        }
      });
      state.list = arr;
      setData(listField, arr);
    },
    setPhotos(state, photos) {
      state.photos = photos;
    },
    updatePhotos(state, photo) {
      const index = state.photos.findIndex(item => item.id === photo.id);
      state.photos.splice(index, 1, photo);
    },
    setCurrentKey(state, key) {
      state.currentKey = key;
    }
  },
  actions: {},
  modules: {}
});
