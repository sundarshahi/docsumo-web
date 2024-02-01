import React from 'react';
import { withRouter } from 'react-router-dom';
import { changeFolderOption } from '@redux/helpers';

import cx from 'classnames';
import { ReactComponent as AddFolderIcon } from 'images/icons/AddFolder.svg';
import { ReactComponent as ExpandIcon } from 'images/icons/expand-arrow.svg';
// import { showToast } from 'client/redux/helpers';
import { ReactComponent as FileUploadIcon } from 'images/icons/file-upload.svg';
import { ReactComponent as FolderUploadIcon } from 'images/icons/folder-upload.svg';
import PropTypes from 'prop-types';
import queryString from 'query-string';
// import copy from 'clipboard-copy';
import OutsideClickHandler from 'react-outside-click-handler';

// import { ReactComponent as MailIcon } from 'images/icons/mail.svg';
// import { ReactComponent as CopyIcon } from 'images/icons/copy.svg';
import styles from './newDropdown.scss';

const NewDropdown = (props) => {
  const {
    className,
    documentTypes,
    // uploadEmailAddress,
    onOutsideClick,
    onUploadFileBtnClick,
    onUploadFolderBtnClick,
  } = props;

  let params = queryString.parse(props.location.search);

  const handleUploadFileBtnClick = (documentTypeValue) => {
    onUploadFileBtnClick(documentTypeValue);
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
        {
          params && params.folder_id ? (
            <>
              {Object.keys(documentTypes).length <= 6
                ? documentTypes.map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <button
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFileBtnClick(value)}
                      >
                        <FileUploadIcon className={styles.icon} />
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
                        onClick={() => handleUploadFileBtnClick(value)}
                      >
                        <FileUploadIcon className={styles.icon} />
                        <p className={styles.label}>Upload {title}</p>
                      </button>
                    );
                  })}
              {Object.keys(documentTypes.slice(6)).length === 0 ? (
                ''
              ) : (
                <div className={cx('unstyled-btn', styles.extend)}>
                  <p className={styles.more}>More</p>
                  <ExpandIcon className={styles.icon} />
                  <div className={cx(styles.rootTwo, styles.filesRootTwo)}>
                    {documentTypes.slice(6).map((documentType) => {
                      const { title, value } = documentType;
                      return (
                        <button
                          key={`file-${value}`}
                          className={cx('unstyled-btn', styles.link)}
                          onClick={() => handleUploadFileBtnClick(value)}
                        >
                          <FileUploadIcon className={styles.icon} />
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
              <button
                className={cx('unstyled-btn', styles.link)}
                // eslint-disable-next-line no-console
                onClick={() => addNewFolder()}
              >
                <AddFolderIcon className={styles.icon} />
                <p className={styles.label}>Folder</p>
              </button>

              <div className={styles.separator} />

              <div
                className={cx('unstyled-btn', styles.link, styles.extend)}
                // eslint-disable-next-line no-console
                //onClick={() => console.log('New File Upload')}
              >
                <FileUploadIcon className={styles.icon} />
                <p className={styles.label}>File Upload</p>
                <ExpandIcon className={styles.icon} />
                <div className={cx(styles.extendTwo, className)}>
                  {documentTypes.map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <button
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFileBtnClick(value)}
                      >
                        <FileUploadIcon className={styles.icon} />
                        <p className={styles.labelText}>Upload {title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className={cx('unstyled-btn', styles.link, styles.extend)}
                // eslint-disable-next-line no-console
                //onClick={() => console.log('New Folder Upload')}
              >
                <FolderUploadIcon className={styles.icon} />

                <p className={styles.label}>Folder Upload</p>
                <ExpandIcon className={styles.icon} />
                <div className={cx(styles.extendTwo, className)}>
                  {documentTypes.map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <button
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFolderBtnClick(value)}
                      >
                        <FolderUploadIcon className={styles.icon} />
                        <p className={styles.labelText}>Upload {title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.separator} />

              {Object.keys(documentTypes).length <= 3
                ? documentTypes.map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <button
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFileBtnClick(value)}
                      >
                        <FileUploadIcon className={styles.icon} />
                        <p className={styles.label}>Upload {title}</p>
                      </button>
                    );
                  })
                : documentTypes.slice(0, 3).map((documentType) => {
                    const { title, value } = documentType;
                    return (
                      <button
                        key={`file-${value}`}
                        className={cx('unstyled-btn', styles.link)}
                        onClick={() => handleUploadFileBtnClick(value)}
                      >
                        <FileUploadIcon className={styles.icon} />
                        <p className={styles.label}>Upload {title}</p>
                      </button>
                    );
                  })}
              {Object.keys(documentTypes.slice(3)).length === 0 ? (
                ''
              ) : (
                <div className={cx('unstyled-btn', styles.extend)}>
                  <p className={styles.more}>More</p>
                  <ExpandIcon className={styles.icon} />

                  <div className={cx(styles.rootTwo, className)}>
                    {documentTypes.slice(3).map((documentType) => {
                      const { title, value } = documentType;
                      return (
                        <button
                          key={`file-${value}`}
                          className={cx('unstyled-btn', styles.link)}
                          onClick={() => handleUploadFileBtnClick(value)}
                        >
                          <FileUploadIcon className={styles.icon} />
                          <p className={styles.labelText}>Upload {title}</p>
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
          )

          /* { documentTypes.map((documentType) => {
                        const { title, value } = documentType;
                        return (
                            <button
                                key={`folder-${value}`}
                                className={cx('unstyled-btn', styles.link)}
                                onClick={() => onUploadFolderBtnClick(value)}
                            >
                                <FolderUploadIcon className={styles.icon}/>
                                <p className={styles.label}>
                                    Folder Upload { title }
                                </p>
                            </button>
                        );
                    }) } */

          /* <div className={styles.separator}/>

                    <button
                        className={cx('unstyled-btn', styles.link)}
                        onClick={handleEmailCopyClick}
                    >
                        <MailIcon className={styles.icon}/>
                        <p className={styles.label}>
                            Email to { uploadEmailAddress }
                        </p>
                        <CopyIcon className={cx(styles.icon, styles.visibleOnHover)}/>
                    </button> */
        }
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

export default withRouter(NewDropdown);
