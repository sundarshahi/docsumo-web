import _ from 'lodash';

import areEqualValuedArrays from './areEqualValuedArrays';

const haveParamsChanged = (oldParams, newParams) => {
  const oldParamKeys = Object.keys(oldParams);
  const newParamKeys = Object.keys(newParams);

  if (oldParamKeys.length !== newParamKeys.length) {
    return true;
  }

  if (!areEqualValuedArrays(oldParamKeys, newParamKeys)) {
    return true;
  }

  for (let key of oldParamKeys) {
    if (_.isArray(oldParams[key])) {
      if (!areEqualValuedArrays(oldParams[key], newParams[key])) {
        return true;
      }
    } else {
      if (oldParams[key] !== newParams[key]) {
        return true;
      }
    }
  }

  return false;
};

export default haveParamsChanged;
