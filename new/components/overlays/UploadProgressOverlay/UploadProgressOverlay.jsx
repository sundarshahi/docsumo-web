import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as classifyActions } from 'new/redux/classification/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { actions as uploadActions } from 'new/redux/upload/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel, NavArrowDown, NavArrowUp } from 'iconoir-react';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';
import { STATUSES } from 'new/constants/document';
import { ERRORS, STATES } from 'new/constants/file';
import {
  CHAMELEON_TOOLTIP_CONTAINER_IDS,
  CHAMELEON_TOUR_TYPES,
  chameleonTriggerTour,
  CHAMLEON_TOUR_IDS,
} from 'new/thirdParty/chameleon';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';

import File from './components/File';

import styles from './UploadProgressOverlay.scss';

class UploadProgressOverlay extends Component {
  static propTypes = {
    files: PropTypes.array.isRequired,
  };

  state = {
    showProcessingTooltip: true,
    showReviewFileTooltip: true,
    isListeningDOMChange: false,
  };

  addMixpanelTrackingForTour = (mixpanelEvent) => {
    const {
      user,
      config: { canSwitchToOldMode = true },
    } = this.props;

    mixpanel.track(mixpanelEvent, {
      'work email': user.email,
      'organization ID': user.orgId,
      mode: user.mode,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  // This code is to solve the issue of tooltip moving when user scrolls the page
  // Details in task: https://app.clickup.com/t/85ztehcee
  // Only related to Chameleon tooltip
  handleUploadFilesOverflow = () => {
    const chmlnProcessingElement = document.getElementById(
      CHAMELEON_TOOLTIP_CONTAINER_IDS.uploadProcessing
    );
    const chmlnReviewingElement = document.getElementById(
      CHAMELEON_TOOLTIP_CONTAINER_IDS.uploadReview
    );

    const uploadFilesElem = document.getElementById('UFUploadFilesContainer');

    if (uploadFilesElem) {
      if (
        (chmlnProcessingElement && chmlnProcessingElement.style.inset) ||
        (chmlnReviewingElement && chmlnReviewingElement.style.inset)
      ) {
        if (uploadFilesElem.style.overflow === 'unset') {
          return;
        }
        uploadFilesElem.style.overflow = 'unset';
      } else {
        if (uploadFilesElem.style.overflow === 'auto') {
          return;
        }
        uploadFilesElem.style.overflow = 'auto';
      }
    }
  };

  // This code is to observe the change in DOM for chmln div
  // Related to task: https://app.clickup.com/t/85ztehcee
  listenTooltipDOMUpdate = (status) => {
    const { isListeningDOMChange } = this.state;
    const chameleonRootElement = document.getElementById('chmln');

    if (!chameleonRootElement) {
      return;
    }

    if (isListeningDOMChange) {
      return;
    } else {
      this.setState({ isListeningDOMChange: true });
    }

    const config = { childList: true };

    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          this.handleUploadFilesOverflow();
        }
      }
    };

    const chameleonRootElementObserver = new MutationObserver(callback);

    if (status === 'disable') {
      chameleonRootElementObserver.disconnect();
    } else {
      chameleonRootElementObserver.observe(chameleonRootElement, config);
    }
  };

  componentWillUnmount() {
    this.listenTooltipDOMUpdate('disable');
  }

  componentDidUpdate() {
    const { showProcessingTooltip, showReviewFileTooltip } = this.state;
    const { files = [], user } = this.props;

    if (!_.isEmpty(user)) {
      this.listenTooltipDOMUpdate('enable');
    }

    const processingFiles =
      files.filter(
        (file) =>
          file.status === STATUSES.NEW || file.status === STATUSES.PROCESSING
      ) || [];

    const reviewingFiles =
      files.filter((file) => file.status === STATUSES.REVIEWING) || [];

    // Only show tooltip once
    if (processingFiles.length && showProcessingTooltip) {
      // The flag to hide tooltip for recurring users is handled in Chameleon
      chameleonTriggerTour(
        CHAMLEON_TOUR_IDS.uploadProcessing,
        CHAMELEON_TOUR_TYPES.uploadProcessing,
        () =>
          this.addMixpanelTrackingForTour(MIXPANEL_EVENTS.upload_processing),
        {
          once: true,
        }
      );

      this.setState({ showProcessingTooltip: false });
    }

    // Only show tooltip once
    if (reviewingFiles.length && showReviewFileTooltip) {
      const chmlnProcessingElement = document.getElementById(
        CHAMELEON_TOOLTIP_CONTAINER_IDS.uploadProcessing
      );
      // Skip triggering the tour for Review button if the processing tooltip is already there
      if (chmlnProcessingElement && chmlnProcessingElement.style.inset) {
        return;
      }

      // The flag to hide tooltip for recurring users is handled in Chameleon
      chameleonTriggerTour(
        CHAMLEON_TOUR_IDS.uploadReview,
        CHAMELEON_TOUR_TYPES.uploadReview,
        () => this.addMixpanelTrackingForTour(MIXPANEL_EVENTS.upload_review),
        {
          once: true,
        }
      );

      this.setState({ showReviewFileTooltip: false });
    }
  }

  startReview = (file) => {
    const { docId = null, title, type, excelType, documentType } = file;
    const { user, config } = this.props;
    const { canSwitchToOldMode = undefined } = config;

    // Add mixpanel Event
    mixpanel.track(MIXPANEL_EVENTS.view_document, {
      origin: 'Review - Upload Widget',
      'work email': user.email,
      'doc type': type,
      label: title,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
    });

    let queryParams = {};

    queryParams = excelType
      ? { ...queryParams, excel_type: true }
      : queryParams;
    documentType === 'auto_classify' || type === 'auto_classify__test'
      ? this.props.classifyActions.startClassify({
          queryParams: {
            ...queryParams,
            doc_type: 'auto_classify',
          },
          docId,
          doc_type: documentType,
          origin: 'Review - Upload Widget',
        })
      : excelType
      ? this.props.documentActions.rtStartExcelView({
          queryParams,
          docId,
          origin: 'Review - Upload Widget',
        })
      : this.props.documentActions.rtStartReview({
          queryParams,
          docId,
          doc_type: documentType,
          origin: 'Review - Upload Widget',
        });
  };

  getNewFilesCount = () => {
    return this.props.files.filter((file) => {
      return file.state === STATES.NEW;
    }).length;
  };

  getUploadingFilesCount = () => {
    return this.props.files.filter((file) => {
      return file.state === STATES.UPLOADING || file.status === STATES.NEW;
    }).length;
  };

  getUploadedFilesCount = () => {
    return this.props.files.filter((file) => {
      return file.status === STATUSES.REVIEWING;
    }).length;
  };

  getUploadFailedFileCount = () => {
    return this.props.files.filter((file) => {
      return file.error === ERRORS.UPLOAD_FAILED;
    }).length;
  };

  getExceedsSizeFileCount = () => {
    return this.props.files.filter((file) => {
      return file.error === ERRORS.EXCEEDS_SIZE;
    }).length;
  };

  getUploadCancelledFileCount = () => {
    return this.props.files.filter((file) => {
      return file.state === STATES.UPLOAD_CANCELLED;
    }).length;
  };

  isUploadFinished = () => {
    return this.props.files.every((file) => {
      return file.state === STATES.UPLOAD_FINISHED;
    });
  };

  handleCloseBtnClick = () => {
    const { uploadActions, user } = this.props;
    const { toggleFileUploadModal, showCancelConfirmationModal } =
      uploadActions;

    if (
      this.isUploadFinished() ||
      this.getUploadFailedFileCount() ||
      this.getExceedsSizeFileCount()
    ) {
      toggleFileUploadModal({ showFileUploadModal: false });
      if (!this.getUploadingFilesCount()) {
        this.handleModalCancelUploadBtnClick();
      }
    } else {
      showCancelConfirmationModal();
    }
  };

  handleExpandCollapseBtnClick = () => {
    this.props.uploadActions.toggleOverlayCollapse();
  };

  handleCancelClick = (id) => {
    this.props.uploadActions.cancelFileUpload({ id });
  };

  handleRetryClick = (id) => {
    this.props.uploadActions.retryFileUpload({ id });
  };

  handleModalCloseBtnClick = () => {
    this.props.uploadActions.hideCancelConfirmationModal();
  };

  handleModalCancelUploadBtnClick = () => {
    const { uploadActions } = this.props;
    const { cancelAllUploads, clearUploads, hideCancelConfirmationModal } =
      uploadActions;
    cancelAllUploads();
    clearUploads();
    hideCancelConfirmationModal();
  };

  renderCancelConfirmationModal = () => {
    const { isCancelConfirmationModalVisible } = this.props;

    if (!isCancelConfirmationModalVisible) return null;

    return (
      <ConfirmationModal
        title={'Cancel Upload'}
        bodyText={
          'Your upload is not complete. Do you want to cancel the upload?'
        }
        proceedActionText='Continue Upload'
        cancelActionText='Cancel'
        onProceedActionBtnClick={this.handleModalCloseBtnClick}
        onCancelActionBtnClick={this.handleModalCancelUploadBtnClick}
        onCloseBtnClick={this.handleModalCloseBtnClick}
      />
    );
  };

  render() {
    const { counts, files, isOverlayCollpased, showFileUploadModal } =
      this.props;

    const retryAll = () => {
      files.forEach((file) => {
        if (
          file.state === STATES.UPLOAD_CANCELLED ||
          file.error === STATES.ERROR
        ) {
          this.handleRetryClick(file.id);
        }
      });
    };
    const totalFileCount = files.length;

    if (!totalFileCount) return null;

    const uploadableFileCount = counts.uploadable;
    const newFileCount = this.getNewFilesCount();
    const uploadingFileCount = this.getUploadingFilesCount();
    const uploadedFileCount = this.getUploadedFilesCount();
    const uploadFailedFileCount = this.getUploadFailedFileCount();
    const uploadCancelledFileCount = this.getUploadCancelledFileCount();

    let title = '';
    let subTitle = '';

    // Title
    if (newFileCount || uploadingFileCount) {
      title = `Uploading ${uploadableFileCount} ${pluralize(
        'items',
        uploadableFileCount
      )}`;
    } else if (!newFileCount && !uploadingFileCount) {
      // All files have been processed
      title = 'Upload complete';
    }

    // Sub-title
    if (!uploadableFileCount) {
      subTitle = 'No files to upload';
    } else if (newFileCount === uploadableFileCount) {
      // Upload hasn't started yet
      subTitle = 'Starting upload...';
    } else if (uploadingFileCount) {
      const fileNumberBeingUploaded = uploadedFileCount + 1;
      const totalUploading =
        uploadableFileCount -
        (uploadFailedFileCount + uploadCancelledFileCount);
      subTitle = `Uploading ${fileNumberBeingUploaded} of ${totalUploading}`;
    } else if (!newFileCount && !uploadingFileCount && uploadedFileCount) {
      subTitle = 'Upload finished';
    }

    const rootClassName = cx(styles.root, {
      [styles.isCollapsed]: isOverlayCollpased,
    });

    if (!showFileUploadModal) {
      return null;
    }

    const fileList = files.filter(
      (item) => item.status !== 'processed' && item.status !== 'review_skipped'
    );
    if (!(fileList.length > 0)) this.handleCloseBtnClick();
    return (
      <div className={rootClassName}>
        {this.renderCancelConfirmationModal()}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>

          <IconButton
            onClick={this.handleExpandCollapseBtnClick}
            icon={isOverlayCollpased ? <NavArrowUp /> : <NavArrowDown />}
            variant='ghost'
          />

          <IconButton
            onClick={this.handleCloseBtnClick}
            icon={<Cancel />}
            variant='ghost'
          />
        </div>

        {!isOverlayCollpased ? (
          <div className={styles.fileListContainer} id='UFUploadFilesContainer'>
            {fileList.map((file, idx) => {
              return (
                <File
                  key={file.id}
                  reviewClassName={idx === 0 && 'UFfirstReviewUpload'}
                  file={file}
                  onCancelClick={this.handleCancelClick}
                  onRetryClick={this.handleRetryClick}
                  startReview={this.startReview}
                  processingClassName='UFFileProcessing'
                />
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }
}

function mapStateToProp(state) {
  const { user, config } = state.app;
  const {
    counts,
    fileIds,
    filesById,
    isOverlayCollpased,
    isCancelConfirmationModalVisible,
    showFileUploadModal,
  } = state.upload;

  const documents = state.documents?.documentsById;

  let files = fileIds.map((fileId) => {
    return filesById[fileId];
  });

  files = files.map((file) => {
    if (file?.status === 'split') {
      return { ...file };
    } else {
      return { ...file, ...documents[file.docId] };
    }
  });

  return {
    user,
    config,
    counts,
    files,
    isOverlayCollpased,
    isCancelConfirmationModalVisible,
    showFileUploadModal,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    uploadActions: bindActionCreators(uploadActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
    classifyActions: bindActionCreators(classifyActions, dispatch),
  };
}

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(UploadProgressOverlay);
