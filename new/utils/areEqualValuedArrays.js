import areEqualValuedSets from './areEqualValuedSets';

/* Checks if two arrays contain same values.
 * Value sequence does not matter.
 */
const areEqualValuedArrays = (arr1, arr2) => {
  return areEqualValuedSets(new Set(arr1), new Set(arr2));
};

export default areEqualValuedArrays;
