import _ from 'lodash';

const createQueryParamSortArray = (sortParams = {}, oldSortArray = []) => {
  let arr = [...oldSortArray];
  Object.keys(sortParams).forEach((name) => {
    const value = sortParams[name];
    arr = _.without(arr, `${name}.asc`, `${name}.desc`);
    arr.push(`${name}.${value}`);
  });

  return arr;
};

export default createQueryParamSortArray;
