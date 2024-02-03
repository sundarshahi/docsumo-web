const areEqualValuedSets = (set1, set2) => {
  if (set1.size !== set2.size) return false;
  for (let a of set1) if (!set2.has(a)) return false;
  return true;
};

export default areEqualValuedSets;
