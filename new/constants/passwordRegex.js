export const number = /[0-9]/;
export const upperCharacter = /[A-Z]/;
export const lowerCharacter = /[a-z]/;
export const specialCharacter = /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/;

const passwordRegex = {
  number,
  upperCharacter,
  lowerCharacter,
  specialCharacter,
};

export default passwordRegex;
