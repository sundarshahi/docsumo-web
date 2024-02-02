import _ from 'lodash';

export const refactorTitle = (config) => {
  const nameValue = {};
  for (let i of config.documentTypes) {
    nameValue[i.value] = i.title;
  }
  return nameValue;
};

export const filteredArray = (firstArray, secondArray) =>
  _.filter(secondArray, (item) => _.includes(firstArray, item.split('__')[0]));

export const isCheckedDocTypes = (isChecked, nameValueList) => {
  let doctypes = [];
  const listDoctypes = Object.entries(isChecked);
  for (let item of listDoctypes) {
    if (item[1]) {
      doctypes.push(nameValueList[item[0]]);
    } else {
      // Dont
    }
  }
  return doctypes.length ? doctypes.join(', ') : 'Select Value';
};

export const matchArrays = (arr1, arr2) => {
  const sortedArr1 = arr1.sort();
  const sortedArr2 = arr2.sort();
  if (sortedArr1.length !== sortedArr2.length) {
    return false;
  }
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }
  return true;
};

export const filterPayloadByEnabled = (obj1, obj2) => {
  let final = obj1;
  for (let item in obj1) {
    if (obj1[item] === 'enable' && item in obj2) {
      delete final[item];
    }
  }
  return final;
};

export const filterEnabledPayload = (obj) => {
  const enabledObj = {};
  for (let i in obj) {
    if (obj[i] === 'enable') {
      enabledObj[i] = obj[i];
    }
  }
  return enabledObj;
};

export const filterAuthorizedDocTypes = (list) => {
  const authorizedDocTypes = [];
  for (let item of list) {
    if (item.canUpload && item.isAuthorized) {
      authorizedDocTypes.push(item?.value);
    }
  }

  return authorizedDocTypes;
};

export const disabledFilterDocTypes = (docTypesChecked, initalChecked) => {
  for (let item in docTypesChecked) {
    if (!docTypesChecked[item]) {
      if (!_.has(initalChecked, item)) {
        // If it was present in list, then disabling is possible.
        delete docTypesChecked[item];
      }
    }
  }
  return docTypesChecked;
};
