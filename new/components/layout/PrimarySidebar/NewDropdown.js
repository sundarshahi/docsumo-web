import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeFolderOption } from 'new/redux/helpers';
import { actions as uploadActions } from 'new/redux/upload/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { NavArrowRight } from 'iconoir-react';
import { ReactComponent as IconAddUpload } from 'new/assets/images/icons/icon-add-folder.svg';
import { ReactComponent as IconFileUpload } from 'new/assets/images/icons/icon-file-upload.svg';
import { ReactComponent as IconFolderUpload } from 'new/assets/images/icons/icon-folder-upload.svg';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './newDropdown.scss';

const NewDropdown = (props) => {
  const {
    className,
    documentTypes,
    // uploadEmailAddress,
    onOutsideClick,
    onUploadFileBtnClick,
    onUploadFolderBtnClick,
    uploadActions,
  } = props;

  let params = queryString.parse(props.location.search);

  const handleUploadFileBtnClick = (documentType) => {
    uploadActions.fileUploadOrigin({
      origin: MIXPANEL_EVENTS.doc_upload_success_sidebar,
    });
    onUploadFileBtnClick(documentType);
  };

  const handleUploadFolderBtnClick = (documentTypeValue) => {
    onUploadFolderBtnClick(documentTypeValue);
  };

  const addNewFolder = () => {
    changeFolderOption();
    props.onOutsideClick();
  };
  /* const handleEmailCopyClick = () => {
        copy(uploadEmailAddress);
        onOutsideClick();
        showToast({
            title: 'Email copied to clipboard',
        });
    }; */

  return (
    <div className={cx(styles.root, className)}>
      <OutsideClickHandler onOutsideClick={onOutsideClick}>
        {params && params.folder_id ? (
          <>
            {Object.keys(documentTypes).length <= 6
              ? documentTypes.map((documentType) => {
                  const { title, value } = documentType;
                  return (
                    <button
                      key={`file-${value}`}
                      className={cx('unstyled-btn', styles.link)}
                      onClick={() => handleUploadFileBtnClick(documentType)}
                    >
                      <IconFileUpload className={styles.icon} />
                      <p className={styles.label}>Upload {title}</p>
                    </button>
                  );
                })
              : documentTypes.slice(0, 6).map((documentType) => {
                  const { title, value } = documentType;
                  return (
                    <button
                      key={`file-${value}`}
                      className={cx('unstyled-btn', styles.link)}
                      onClick={() => handleUploadFileBtnClick(documentType)}
                    >
                      <IconFileUpload className={styles.icon} />
                      <p className={styles.label}>Upload {title}</p>
                    </button>
                  );
                })}
            {Object.keys(documentTypes.slice(6)).length === 0 ? (
              ''
            ) : (
              <div className={cx('unstyled-btn', styles.extend)}>
                <p className={styles.more}>More</p>
                <NavArrowRight className={styles.icon} />
                <div className={cx(styles.rootTwo)}>
                  {documentTypes.slice(6).map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <button
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFileBtnClick(documentType)}
                      >
                        <IconFileUpload className={styles.icon} />
                        <p className={styles.label}>Upload {title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.separator} />

            <p className={styles.hintText}>
              You can select multiples files and folders
            </p>
          </>
        ) : (
          <>
            <div className={styles.linkWrap}>
              <button
                className={cx('unstyled-btn', styles.link, styles.extend)}
              >
                <IconFileUpload className={styles.icon} />
                <p className={styles.label}>File Upload</p>
                <NavArrowRight className={styles.icon} />
                <div className={cx(styles.extendTwo, className)}>
                  {documentTypes.map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <div
                        role='presentation'
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFileBtnClick(documentType)}
                      >
                        <IconFileUpload className={styles.icon} />
                        <p className={styles.labelText}>Upload {title}</p>
                      </div>
                    );
                  })}
                </div>
              </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.linkWrap}>
              <button
                className={cx('unstyled-btn', styles.link)}
                // eslint-disable-next-line no-console
                onClick={() => addNewFolder()}
              >
                <IconAddUpload className={styles.icon} />
                <p className={styles.label}>Create New Folder</p>
              </button>

              <div
                className={cx('unstyled-btn', styles.link, styles.extend)}
                // eslint-disable-next-line no-console
                //onClick={() => console.log('New Folder Upload')}
              >
                <IconFolderUpload className={styles.icon} />

                <p className={styles.label}>Folder Upload</p>
                <NavArrowRight className={styles.icon} />
                <div className={cx(styles.extendTwo, className)}>
                  {documentTypes.map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <button
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFolderBtnClick(value)}
                      >
                        <IconFolderUpload className={styles.icon} />
                        <p className={styles.labelText}>Upload {title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.separator} />

            <p className={styles.hintText}>
              You can select multiples files and folders
            </p>
          </>
        )}
      </OutsideClickHandler>
    </div>
  );
};

NewDropdown.propTypes = {
  className: PropTypes.string,
  documentTypes: PropTypes.array.isRequired,
  //uploadEmailAddress: PropTypes.string.isRequired,
  onOutsideClick: PropTypes.func.isRequired,
  onUploadFileBtnClick: PropTypes.func.isRequired,
  // onUploadFolderBtnClick: PropTypes.func.isRequired,
};

export default withRouter(
  connect(mapStateToProp, mapDispatchToProps)(NewDropdown)
);

function mapStateToProp({ app }) {
  return {
    user: app.user,
    config: app.config,
    isTestingMode: !!(app.user?.mode !== 'prod'),
    onboardingTutorialOrigin: app.onboardingTutorialOrigin,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    uploadActions: bindActionCreators(uploadActions, dispatch),
  };
}
