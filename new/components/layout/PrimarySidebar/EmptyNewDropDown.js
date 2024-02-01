import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Plus } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { ReactComponent as EmptyFolder } from 'new/assets/images/icons/old-folder.svg';
import { ReactComponent as Line } from 'new/assets/images/icons/old-line.svg';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import PropTypes from 'prop-types';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './emptyNewDropDown.scss';

const EmptyNewDropdown = (props) => {
  const {
    className,
    onOutsideClick,
    documentActions,
    user,
    config,
    origin = '',
  } = props;
  const { canSwitchToOldMode = true } = config;

  const handleNewDocumentTypeClick = () => {
    onOutsideClick();
    documentActions.displaySelectDocumentTypeModal(true);

    //Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.add_doc_type, {
      'work email': user.email,
      'organization ID': user.orgId,
      version: 'new',
      mode: user.mode,
      canSwitchUIVersion: canSwitchToOldMode,
      origin,
    });
  };

  return (
    <div className={cx(styles.root, className)}>
      <OutsideClickHandler onOutsideClick={onOutsideClick}>
        <div className={styles.container}>
          <EmptyFolder className={styles.container__icon} />
          <Line className='mt-1' />
          <p className={styles.container__heading}>No Document type found!</p>
          <p className={styles.container__title}>
            Please create a new document type before uploading files
          </p>
          <Button
            variant='outlined'
            icon={<Plus />}
            className={styles.container__button}
            onClick={handleNewDocumentTypeClick}
          >
            Add Document Type
          </Button>
        </div>
      </OutsideClickHandler>
    </div>
  );
};

EmptyNewDropdown.propTypes = {
  className: PropTypes.string,

  onOutsideClick: PropTypes.func.isRequired,
};

function mapStateToProp(state) {
  const { user, config } = state.app;

  return {
    user,
    config,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}
export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(EmptyNewDropdown)
);
