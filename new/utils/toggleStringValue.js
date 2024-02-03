const toggleStringValue = (str, val1, val2) => {
  if (str === val1) return val2;
  if (str === val2) return val1;
  return null;
};

export default toggleStringValue;
