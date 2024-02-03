import _ from 'lodash';

const getQueryParamDateRangeAsObject = (paramValues) => {
  const obj = {};

  if (!paramValues || _.isEmpty(paramValues)) {
    return obj;
  }

  if (!_.isArray(paramValues)) {
    paramValues = [paramValues];
  }

  paramValues.forEach((paramValue) => {
    const parts = _.split(paramValue, ':', 1);
    const key = parts[0] || '';
    const value = paramValue.substring(key.length + 1);

    if (key && value) {
      obj[key] = value;
    }
  });

  return obj;
};

export default getQueryParamDateRangeAsObject;
