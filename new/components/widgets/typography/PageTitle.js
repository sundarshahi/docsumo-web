import React from 'react';

import cx from 'classnames';

import Text from './Text';

import styles from './pageTitle.scss';

const PageTitle = (props) => {
  props = {
    tag: 'h1',
    ...props,
    className: cx(styles.root, props.className),
  };

  return <Text {...props} />;
};

PageTitle.propTypes = {
  ...Text.propTypes,
};

export default PageTitle;
