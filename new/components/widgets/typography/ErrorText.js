import React from 'react';

import cx from 'classnames';

import Text from './Text';

import styles from './errorText.scss';

const ErrorText = React.forwardRef((props, ref) => {
  props = {
    ...props,
    className: cx(styles.root, props.className),
  };

  return <Text {...props} ref={ref} />;
});

ErrorText.propTypes = {
  ...Text.propTypes,
};

export default ErrorText;
