export function filterUniqueObjByKey(array, key) {
  return Object.values(
    array.reduce((uniqueMap, item) => {
      uniqueMap[item[key]] = item;
      return uniqueMap;
    }, {})
  );
}
