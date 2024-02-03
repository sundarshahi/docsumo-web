/**
 * Get value from storage for given key.
 *
 * @param  {string}  key
 * @return {string}
 */
export function get(key) {
  if (!window?.localStorage) return null;

  const value = localStorage.getItem(key);
  const numPatt = new RegExp(/^\d+$/);
  const jsonPatt = new RegExp(/[\\[\\{].*[\\}\]]/);

  if (value) {
    if (jsonPatt.test(value)) {
      return JSON.parse(value);
    } else if (numPatt.test(value)) {
      return parseFloat(value);
    } else {
      return value;
    }
  } else {
    return null;
  }
}

/**
 * Set key value pair in storage.
 *
 * @param {string} key
 * @param {string} value
 */
export function set(key, value) {
  if (!window?.localStorage) return null;

  if (typeof value === 'object') {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.setItem(key, value);
  }
}

/**
 * Remove key value pair in storage.
 *
 * @param {string} key
 */
export function remove(key) {
  if (!window?.localStorage) return null;
  localStorage.removeItem(key);
}

/**
 * Clear storage.
 *
 * @return {string}
 */
export function clear() {
  if (!window?.localStorage) return null;
  return localStorage.clear();
}
