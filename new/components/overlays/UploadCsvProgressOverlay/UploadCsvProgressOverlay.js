import React, { Component } from 'react';
import { connect } from 'react-redux';
import { actions as uploadActions } from 'new/redux/uploadcsv/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel, NavArrowDown, NavArrowUp } from 'iconoir-react';
import ConfirmationModal from 'new/components/shared/FiledConfirmationModal';
import { ERRORS, STATES } from 'new/constants/file';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';

import File from './components/File';

import styles from './UploadCsvProgressOverlay.scss';

class UploadCsvProgressOverlay extends Component {
  static propTypes = {
    files: PropTypes.array.isRequired,
  };

  getNewFilesCount = () => {
    return this.props.files.filter((file) => {
      return file.state === STATES.NEW;
    }).length;
  };

  getUploadingFilesCount = () => {
    return this.props.files.filter((file) => {
      return file.state === STATES.UPLOADING;
    }).length;
  };

  getUploadedFilesCount = () => {
    return this.props.files.filter((file) => {
      return file.state === STATES.UPLOAD_FINISHED;
    }).length;
  };

  getUploadFailedFileCount = () => {
    return this.props.files.filter((file) => {
      return file.error === ERRORS.UPLOAD_FAILED;
    }).length;
  };

  getUploadCancelledFileCount = () => {
    return this.props.files.filter((file) => {
      return file.state === STATES.UPLOAD_CANCELLED;
    }).length;
  };

  handleCloseBtnClick = () => {
    const newFileCount = this.getNewFilesCount();
    const uploadingFileCount = this.getUploadingFilesCount();

    if (!newFileCount && !uploadingFileCount) {
      this.props.actions.clearUploads();
    } else {
      this.props.actions.showCancelConfirmationModal();
    }
  };

  handleExpandCollapseBtnClick = () => {
    this.props.actions.toggleOverlayCollapse();
  };

  handleRetryClick = (id) => {
    this.props.actions.retryFileUpload({ id });
  };

  handleCancelClick = (id) => {
    this.props.actions.cancelFileUpload({ id });
  };

  handleModalCloseBtnClick = () => {
    this.props.actions.hideCancelConfirmationModal();
  };

  handleModalContinueUploadBtnClick = () => {
    this.props.actions.hideCancelConfirmationModal();
  };

  handleModalCancelUploadBtnClick = () => {
    this.props.actions.hideCancelConfirmationModal();
    this.props.actions.cancelAllUploads();
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
        onProceedActionBtnClick={this.handleModalContinueUploadBtnClick}
        onCancelActionBtnClick={this.handleModalCancelUploadBtnClick}
        onCloseBtnClick={this.handleModalCloseBtnClick}
      />
    );
  };

  render() {
    const { counts, files, isOverlayCollpased } = this.props;

    const retryAll = () => {
      files.forEach((file) => {
        if (
          file.state === 'upload_cancelled' ||
          file.error === 'upload_failed'
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
    } else {
      // All files have been processed
      title = `Uploaded ${uploadedFileCount} ${pluralize(
        'items',
        uploadedFileCount
      )}`;
    }

    // Sub-title
    if (!uploadableFileCount) {
      subTitle = 'No files to upload';
    } else {
      if (newFileCount === uploadableFileCount) {
        // Upload hasn't started yet
        subTitle = 'Starting Upload';
      } else {
        if (uploadingFileCount) {
          const fileNumberBeingUploaded = uploadedFileCount + 1;
          const totalUploading =
            uploadableFileCount -
            (uploadFailedFileCount + uploadCancelledFileCount);
          subTitle = `Uploading ${fileNumberBeingUploaded} of ${totalUploading}`;
        } else {
          subTitle = 'Upload finished';
        }
      }
    }

    const rootClassName = cx(styles.root, {
      [styles.isCollapsed]: isOverlayCollpased,
    });

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
          <div className={styles.fileListContainer}>
            {files.map((file) => {
              return (
                <File
                  key={file.id}
                  file={file}
                  onCancelClick={this.handleCancelClick}
                  onRetryClick={this.handleRetryClick}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }
}

function mapStateToProp({ uploadcsv }) {
  const {
    counts,
    fileIds,
    filesById,
    isOverlayCollpased,
    isCancelConfirmationModalVisible,
  } = uploadcsv;

  const files = fileIds.map((fileId) => {
    return filesById[fileId];
  });

  return {
    counts,
    files,
    isOverlayCollpased,
    isCancelConfirmationModalVisible,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(uploadActions, dispatch),
  };
}

export default connect(
  mapStateToProp,
  mapDispatchToProps
)(UploadCsvProgressOverlay);
