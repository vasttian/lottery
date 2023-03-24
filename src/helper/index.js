export function setData(key, value) {
  if (typeof value === 'string') {
    return localStorage.setItem(key, value);
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    return err;
  }
}

export function getData(key) {
  const value = localStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

export function removeData(key) {
  return localStorage.removeItem(key);
}

export function clearData() {
  return localStorage.clear();
}

export function getDomData(element, dataName) {
  if (!element || !dataName || !element.getAttribute) {
    return;
  }

  return element.getAttribute('data-' + dataName);
}

export const systemConfigField = 'systemConfig';

// 配置数据
export const configField = 'config';

// 抽奖结果
export const resultField = 'result';

// 新增奖项
export const newLotteryField = 'newLottery';

export const firstPrizeKey = 'firstprizekey20230323125900';

// 名单
export const listField = 'list';
export function conversionCategoryName(key, config) {
  let name = '';
  switch (key) {
    case 'firstPrize':
      name = config && config.name;
      break;
    default:
      break;
  }

  const newLottery = getData(newLotteryField) || [];
  const findres = newLottery.find(item => item.key === key);
  if (findres) {
    name = findres.name;
  }

  return name;
}

export function getFieldValue(key) {
  return getData(key) || [];
}

export function getLottery(key) {
  const newLottery = getData('newLottery') || [];
  const lottery = newLottery.find(item => item.key === key);
  return lottery || {};
}

export function splitFileName(text) {
  var pattern = /\.{1}[a-z]{1,}$/;
  if (pattern.exec(text) !== null) {
    return text.slice(0, pattern.exec(text).index);
  }

  return text;
}
