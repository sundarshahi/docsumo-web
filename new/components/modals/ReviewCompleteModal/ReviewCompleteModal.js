import React, { useState } from 'react';
import { connect } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import download from 'downloadjs';
import { Cancel, PageFlip, Table2Columns } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import * as api from 'new/api';
import { ReactComponent as CheckCircle } from 'new/assets/images/icons/check-circle.svg';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import { SUPPORT_LINK } from 'new/constants/urllink';
import {
  CHAMELEON_TOUR_TYPES,
  chameleonUpdateUserData,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal';

import styles from './ReviewCompleteModal.scss';

function ReviewCompleteModal(props) {
  const {
    showFirstReviewCompleteModal,
    onActionComplete = null,
    documentActions,
    docMeta,
    user,
    config,
    startReviewTour,
  } = props || {};
  const { canSwitchToOldMode = true } = config || {};
  const [downloadingType, setDownloadngType] = useState('');

  const handleCloseBtnClick = () => {
    documentActions.rtShowFirstReviewCompleteModal({
      showFirstReviewCompleteModal: false,
    });

    if (startReviewTour) {
      // Disable all tour tooltips of review screen
      // if user had started only the tour of review screen
      chameleonUpdateUserData(
        user.userId,
        {
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase1]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase2]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase3_noGrids]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase3_tableGrid]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase4]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase5]: false,
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase6]: false,
        },
        true
      );
    } else {
      // To not show this popup once seen/action taken
      chameleonUpdateUserData(
        user.userId,
        {
          [CHAMELEON_TOUR_TYPES.reviewScreenPhase6]: false,
          [CHAMELEON_TOUR_TYPES.happyPathComplete]: true,
        },
        true
      );
    }

    if (onActionComplete) {
      onActionComplete();
    }
  };

  const handleDownloadBtnClick = async (type) => {
    showToast({
      title: 'Downloading...',
      duration: 3000,
    });

    setDownloadngType(type);

    mixpanel.track(MIXPANEL_EVENTS.document_download, {
      'work email': user.email,
      'document type': docMeta.type,
      'download option': type,
      label: docMeta.title,
      origin: 'Review complete modal',
      docId: docMeta.docId,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
      startReviewTour,
      downloadType: type,
    });

    try {
      let response = await api.downlaodMultiDocs({
        type: type,
        doc_ids: [docMeta.docId],
      });
      const { responsePayload } = response;
      const downloadUrl = _.get(responsePayload, 'data.downloadUrl');
      download(downloadUrl);
    } catch (e) {
      showToast({
        title:
          'An error occured while downloading file. Please try again later',
        error: true,
      });
    } finally {
      setDownloadngType('');

      handleCloseBtnClick();
    }
  };

  return (
    <Modal
      show={showFirstReviewCompleteModal}
      className={styles.modal}
      size='xs'
      onCloseHandler={handleCloseBtnClick}
    >
      <IconButton
        icon={<Cancel height={24} width={24} />}
        className={styles.close}
        variant='ghost'
        onClick={handleCloseBtnClick}
      />
      <div className={styles.content}>
        <CheckCircle />
        <h1 className={styles.heading}>
          <span>Congrats!</span>&nbsp;You’ve processed your first document
        </h1>
        <p className={styles.text}>
          Download to verify the data format for ingestion in <br />
          the downstream software.
        </p>
        <div className={styles.buttonContainer}>
          <button
            type='button'
            className={styles.button}
            onClick={() => handleDownloadBtnClick('csv_long')}
          >
            <span className={styles.button_icon}>
              {downloadingType === 'csv_long' ? (
                <span className={styles.button_loader}>
                  <LoaderIcon />
                </span>
              ) : (
                <Table2Columns width={24} height={24} />
              )}
            </span>
            <span className={styles.button_text}>Download XLS</span>
          </button>
          <button
            type='button'
            className={styles.button}
            onClick={() => handleDownloadBtnClick('json')}
          >
            <span className={styles.button_icon}>
              {downloadingType === 'json' ? (
                <span className={styles.button_loader}>
                  <LoaderIcon />
                </span>
              ) : (
                <PageFlip width={24} height={24} />
              )}
            </span>
            <span className={styles.button_text}>Download JSON</span>
          </button>
        </div>
        <p className={cx(styles.text, styles.text__sm)}>
          Note: You can always modify the format of the exported file.&nbsp;
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href={SUPPORT_LINK.DOWNLOAD_EXTRACTED_DATA}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.link}
          >
            {/* TODO: Add support page link here */}
            Learn more
          </a>
        </p>
      </div>
    </Modal>
  );
}

function mapStateToProp({ documents }) {
  const {
    reviewTool: { showFirstReviewCompleteModal },
  } = documents;

  return {
    showFirstReviewCompleteModal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(ReviewCompleteModal);
