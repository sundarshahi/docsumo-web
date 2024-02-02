/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';

import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import LinearProgressbar from 'new/ui-elements/LinearProgressBar/LinearProgressbar';
import Modal from 'new/ui-elements/Modal/Modal';

import styles from './index.scss';

const IDLE_VALUE = 70;

const DocumentProcessModal = ({
  title,
  progressValue = 0,
  embeddedApp = false,
  closeReviewTool,
  user = {},
  docMeta = {},
  showModal = false,
  config = {},
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    closeReviewTool();
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel tracking
    mixpanel.track(MIXPANEL_EVENTS.view_documents_doc_processing, {
      'work email': user?.email,
      'document type': docMeta?.type,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  return (
    <Modal show={showModal} size='sm'>
      <div className={styles.modal}>
        <div className={styles.header}>{title}</div>
        <div className={styles.progressBar_header}>
          Please wait, your document is still processing...
        </div>
        <LinearProgressbar value={progressValue} showLabel={false} size='lg' />
        {progressValue === 0 ? (
          <div className={styles.progressBar_footer}>
            {embeddedApp ? (
              <span>
                Your document is taking a bit longer to process.
                <br /> Please wait for a while.
              </span>
            ) : (
              <span>
                Your document is taking a bit longer to process. To view all
                your documents,&nbsp;
                <a href='#' onClick={(e) => handleClick(e)}>
                  click here
                </a>
              </span>
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    </Modal>
  );
};

export default DocumentProcessModal;
