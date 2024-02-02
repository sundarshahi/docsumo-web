import React, { useState } from 'react';
import { showIntroModal } from 'new/redux/helpers';

import { Upload } from 'iconoir-react';
import { ReactComponent as EmptyStateIcon } from 'new/assets/images/icons/no-documents.svg';
import EmptyNewDropDown from 'new/components/layout/PrimarySidebar/EmptyNewDropDown';
import NewDropdown from 'new/components/layout/PrimarySidebar/NewDropdown';
import Button from 'new/ui-elements/Button/Button';

import styles from './EmptyTable.scss';

function EmptyTable({
  uid,
  config,
  user,
  onUploadFileBtnClick,
  onUploadFolderBtnClick,
}) {
  const [isNewDropdownVisible, setIsNewDropdownVisible] = useState(false);
  const handleWatchIntroClick = () => showIntroModal();
  const documentTypes = config?.documentTypes;

  const uploadableDocumentTypes = documentTypes.filter((item) =>
    item.isAuthorized !== undefined
      ? item.isAuthorized && item.canUpload
      : item.canUpload
  );
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyState_icon}>
        <EmptyStateIcon />
      </div>
      <p className={styles.emptyState_text}>Oh... It's empty here</p>
      {uid === 'all' && (
        <div className={styles.emptyState_content}>
          <p>Click below to upload some documents</p>
          <div className={styles.emptyState_buttons}>
            <Button
              variant='outlined'
              size='small'
              onClick={handleWatchIntroClick}
            >
              Watch Intro
            </Button>
            <Button
              variant='contained'
              size='small'
              icon={Upload}
              onClick={() => setIsNewDropdownVisible(true)}
            >
              Upload Documents
            </Button>
          </div>
          {isNewDropdownVisible && (
            <>
              {uploadableDocumentTypes?.length ? (
                <NewDropdown
                  className={styles.emptyState_newdropdown}
                  documentTypes={uploadableDocumentTypes}
                  uploadEmailAddress={user.uploadEmail}
                  onOutsideClick={() => setIsNewDropdownVisible(false)}
                  onUploadFileBtnClick={onUploadFileBtnClick}
                  onUploadFolderBtnClick={onUploadFolderBtnClick}
                />
              ) : (
                <EmptyNewDropDown
                  className={styles.emptyState_newdropdown}
                  onOutsideClick={() => setIsNewDropdownVisible(false)}
                  origin='Upload - My Documents'
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyTable;
