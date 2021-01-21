import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  resultField,
  newLotteryField,
  listField
} from '@/helper/index';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {
      name: '一面数据年会',
      number: 50,
      firstPrize: 1
    },
    result: {
      firstPrize: []
    },
    newLottery: [],
    list: [],
    photos: [],
    resetKeys: 0,
  },
  mutations: {
    setClearConfig(state) {
      state.config = {
        name: '年会抽奖',
        number: 50,
        firstPrize: 1
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
    setClearStore(state) {
      state.config = {
        name: '年会抽奖',
        number: 50,
        firstPrize: 1
      };
      state.result = {
        firstPrize: []
      };
      state.newLottery = [];
      state.list = [];
      state.photos = [];
    },
    setConfig(state, config) {
      state.config = Object.assign({}, config);
    },
    setResult(state, result = {}) {
      state.result = result;
      setData(resultField, state.result);
    },
    setNewLottery(state, newLottery) {
      if (state.newLottery.find(item => item.key === newLottery.key)) {
        return;
      }

      // 在开头添加新奖项
      state.newLottery.unshift(newLottery);
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
    }
  },
  actions: {},
  modules: {}
});
