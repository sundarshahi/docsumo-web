import React from 'react';

import cx from 'classnames';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import PropTypes from 'prop-types';

import styles from './spinningLoaderIcon.scss';

const SpinningLoaderIcon = (props) => {
  const { className, ...otherProps } = props;

  return <LoaderIcon className={cx(styles.root, className)} {...otherProps} />;
};

SpinningLoaderIcon.propTypes = {
  /**
   * Class name passed to the loader icon.
   */
  className: PropTypes.string,
};

export default SpinningLoaderIcon;
