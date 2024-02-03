import _ from 'lodash';

/*
 *
 *
 */
const getQueryParamSortValuesAsObject = (
  queryParams,
  { sortKey = 'sort_by' } = {}
) => {
  const obj = {};
  if (_.isArray(queryParams[sortKey])) {
    queryParams[sortKey].forEach((item) => {
      const parts = _.split(item, '.');
      const name = _.first(parts);
      const value = _.last(parts);
      if (['asc', 'desc'].includes(value)) {
        obj[name] = value;
      }
    });
  }

  return obj;
};

export default getQueryParamSortValuesAsObject;
