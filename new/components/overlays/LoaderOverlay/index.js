import React from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';

import styles from './index.scss';

const LoaderOverlay = (props) => {
  if (!props.showLoaderOverlay) {
    return null;
  }

  return (
    <Portal>
      <div className={styles.root}>
        <div className={styles.loaderIconContainer}>
          <LoaderIcon className={styles.loaderIcon} />
        </div>
      </div>
    </Portal>
  );
};

LoaderOverlay.propTypes = {
  appActions: PropTypes.object.isRequired,
  showLoaderOverlay: PropTypes.bool.isRequired,
};

function mapStateToProp({ app }) {
  const { showLoaderOverlay } = app;

  return {
    showLoaderOverlay,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(LoaderOverlay);
