import _ from 'lodash';

export function getFirstAndLastName(fullName) {
  let name = {
    firstName: '',
    lastName: '',
  };

  if (!_.isEmpty(fullName)) {
    const nameArr = fullName.split(' ');
    if (!_.isEmpty(nameArr) && nameArr.length > 0) {
      name.lastName = nameArr.pop();
      name.firstName = nameArr.join(' ');
    }
  }

  return name;
}

export function replaceAllWords(str = '', replacements = {}) {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string.');
  }

  const pattern = new RegExp(Object.keys(replacements).join('|'), 'g');
  return str.replace(pattern, (matched) => replacements[matched]);
}
