import React from 'react';

import CircularProgressbar from 'react-circular-progressbar';

import styles from './circularProgressBar.scss';

// Docs: https://www.npmjs.com/package/react-circular-progressbar

const CircularProgressBar = (props) => {
  const classes = {
    root: styles.root,
    trail: styles.trail,
    path: styles.path,
    text: styles.text,
    background: styles.background,
  };

  const newProps = {
    ...props,
    classes: {
      ...classes,
      ...props.classes,
    },
  };

  return <CircularProgressbar {...newProps} />;
};

CircularProgressBar.propTypes = CircularProgressbar.propTypes;

export default CircularProgressBar;
