import camelcaseKeys from 'camelcase-keys';
import _ from 'lodash';

export default function camelCase(input) {
  if (!_.isObject(input)) {
    return input;
  }

  return camelcaseKeys(input, {
    deep: true,
  });
}
