/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import * as api from 'new/api';
import AuditLogModal from 'new/components/shared/AuditLogModal';
import Tooltip from 'new/ui-elements/Tooltip';

import styles from './UploadedByCell.scss';

function UploadedByCell({ cellData, appActions }) {
  const {
    uploadedBy: { fullName },
    displayType,
    title,
    docId,
  } = cellData;

  const [showAuditLogModal, setAuditLogModalVisibility] = useState(false);
  const [logsData, setLogsData] = useState([]);

  const handleUserNameClick = async (e) => {
    e.stopPropagation();
    appActions.showLoaderOverlay();

    // Get user activity logs
    try {
      const response = await api.getLogInfo({
        queryParams: {
          doc_id: docId,
        },
      });
      const {
        data: { data },
      } = response.responsePayload;
      setLogsData(data);
      setAuditLogModalVisibility(true);
    } catch (e) {
      //do nothing
    } finally {
      appActions.hideLoaderOverlay();
    }
  };

  if (displayType === 'folder') {
    return (
      <span title={fullName} className={styles.userName}>
        {fullName}
      </span>
    );
  }

  return (
    <>
      <Tooltip label='View audit log' placement='top'>
        <span
          className={cx(
            styles.userName,
            styles.userName__clickable,
            'ellipsis'
          )}
          onClick={handleUserNameClick}
          title={fullName}
        >
          {fullName}
        </span>
      </Tooltip>
      {showAuditLogModal && (
        <AuditLogModal
          title={title}
          data={logsData}
          onCloseBtnClick={() => setAuditLogModalVisibility(false)}
        />
      )}
    </>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(UploadedByCell);
