import React from 'react';

import _ from 'lodash';

import Button, { APPEARANCES, SIZES } from './Button';

// const SmallButton = (props) => {
//     return (
//         <Button {...props} size={SIZES.SMALL}/>
//     );
// };
// SmallButton.propTypes = _.omit(Button.propTypes, 'size');

const LargeButton = (props) => {
  return <Button {...props} size={SIZES.LARGE} />;
};
LargeButton.propTypes = _.omit(Button.propTypes, 'size');

export {
  APPEARANCES,
  Button,
  // SmallButton,
  LargeButton,
  SIZES,
};
