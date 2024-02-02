import React from 'react';
import { connect } from 'react-redux';

import { Portal } from 'react-portal';

import styles from './DarkOverlay.scss';

const DarkOverlay = ({ showDarkOverlay }) => {
  if (!showDarkOverlay) {
    return null;
  }

  return (
    <Portal>
      <div className={styles.root}></div>
    </Portal>
  );
};

function mapStateToProp({ app }) {
  const { showDarkOverlay } = app;

  return {
    showDarkOverlay,
  };
}

export default connect(mapStateToProp)(DarkOverlay);
