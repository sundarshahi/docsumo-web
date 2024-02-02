import React from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import Notification from 'new/ui-elements/Notification/Notification';

const ToastContainer = ({ toast, appActions }) => {
  const closeNotification = (id) => {
    appActions.removeToast({ id });
  };

  return (
    <Notification
      toastList={toast ? [{ ...toast }] : []}
      duration={4000}
      position='top-right'
      variant='toast'
      closeNotification={closeNotification}
    />
  );
};

function mapStateToProp({ app }) {
  const { toast } = app;

  return {
    toast,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(ToastContainer);
