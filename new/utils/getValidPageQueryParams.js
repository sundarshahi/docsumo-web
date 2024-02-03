import _ from 'lodash';
import queryString from 'query-string';

const getValidPageQueryParams = (locationSearch, allowedParams = {}) => {
  const params = queryString.parse(locationSearch);
  const validParams = {};

  Object.keys(allowedParams).forEach((key) => {
    if (!_.has(params, key)) {
      if (allowedParams[key].default) {
        validParams[key] = allowedParams[key].default;
      }
      return;
    }

    validParams[key] = params[key];

    if (allowedParams[key].multiple) {
      if (!_.isArray(validParams[key])) {
        validParams[key] = [validParams[key]];
      }
    } else {
      if (_.isArray(validParams[key])) {
        validParams[key] = _.first(validParams[key]);
      }
    }

    if (allowedParams[key].type === 'number') {
      if (_.isArray(validParams[key])) {
        validParams[key] = validParams[key].map((item) => parseInt(item));
      } else {
        validParams[key] = parseInt(validParams[key]);
      }
    }
  });

  return validParams;
};

export default getValidPageQueryParams;
