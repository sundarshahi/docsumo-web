import React from 'react';

import cx from 'classnames';
import { CheckCircle, DeleteCircle, Page, Refresh } from 'iconoir-react';
import { ReactComponent as ErrorIcon } from 'new/assets/images/icons/error.svg';
import { ErrorText } from 'new/components/widgets/typography';
import { ERRORS, STATES } from 'new/constants/file';
import FilePropTypes from 'new/helpers/propTypes/file';
import CircularProgress from 'new/ui-elements/CircularProgress/CircularProgress';
import PropTypes from 'prop-types';

import styles from './file.scss';

const File = (props) => {
  const { file, onRetryClick, onCancelClick } = props;

  const { id, name, state, error, uploadProgress, errorMsg } = file;

  let errorMessage = '';
  let infoMessage = '';
  if (state === STATES.ERROR) {
    /* eslint-disable indent */
    switch (error) {
      case ERRORS.UNSUPPORTED: {
        errorMessage = 'Unsupported file type';
        break;
      }

      case ERRORS.EXCEEDS_SIZE: {
        errorMessage = 'File is too big';
        break;
      }

      case ERRORS.ZERO_SIZE: {
        errorMessage = 'This file contains no data';
        break;
      }

      case ERRORS.READ_ABORTED: {
        errorMessage = 'Failed to read file';
        break;
      }

      case ERRORS.READ_ERRORED: {
        errorMessage = 'Failed to read file';
        break;
      }

      case ERRORS.UPLOAD_FAILED: {
        errorMessage = `${errorMsg} in uploaded csv` || 'Failed to upload file';
        break;
      }
    }
    /* eslint-enable indent */
  }

  if (state === STATES.UPLOAD_CANCELLED) {
    infoMessage = 'Upload cancelled';
  }

  const showCancelBtn = state === STATES.NEW || state === STATES.UPLOADING;
  const showRetryBtn =
    state === STATES.UPLOAD_CANCELLED || error === ERRORS.UPLOAD_FAILED;

  const rootClassName = cx(styles.root, {
    [styles.new]: state === STATES.NEW,
    [styles.uploading]: state === 'uploading',
    [styles.uploaded]: state === STATES.UPLOAD_FINISHED,
  });

  return (
    <div className={rootClassName}>
      <Page className={styles.fileIcon} />
      <div className={styles.details}>
        <p className={cx('ellipsis', styles.title)}>{name}</p>

        {errorMessage ? (
          <ErrorText className={styles.errorMessage}>{errorMessage}</ErrorText>
        ) : null}

        {infoMessage ? (
          <p className={styles.infoMessage}>{infoMessage}</p>
        ) : null}
      </div>

      <div className={styles.rhs}>
        {state === STATES.NEW ? (
          <CircularProgress
            value={0}
            className={styles.circularProgress}
            hideText={true}
            strokeWidth={10}
          />
        ) : null}

        {state === STATES.UPLOADING ? (
          <CircularProgress
            value={uploadProgress || 0}
            className={styles.circularProgress}
            hideText={true}
            strokeWidth={10}
          />
        ) : null}

        {showCancelBtn ? (
          <button
            title='Cancel'
            className={cx('unstyled-btn', styles.cancelBtn)}
            onClick={() => onCancelClick(id)}
          >
            <DeleteCircle className={styles.cancelIcon} />
          </button>
        ) : null}

        {state === STATES.UPLOAD_FINISHED ? (
          <CheckCircle className={styles.checkIcon} />
        ) : null}

        {showRetryBtn ? (
          <button
            title='Retry'
            className={cx('unstyled-btn', styles.retryBtn)}
            onClick={() => onRetryClick(id)}
          >
            <Refresh className={styles.retryIcon} />
          </button>
        ) : null}

        {!showRetryBtn && state === STATES.ERROR ? (
          <ErrorIcon className={styles.errorIcon} />
        ) : null}
      </div>
    </div>
  );
};

File.propTypes = {
  file: FilePropTypes,
  onCancelClick: PropTypes.func.isRequired,
  onRetryClick: PropTypes.func.isRequired,
};

export default File;
