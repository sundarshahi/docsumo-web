/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect } from 'react';

import { Folder, Page } from 'iconoir-react';
import RenameFileFolderBox from 'new/components/shared/RenameFileFolderBox';
import * as documentConstants from 'new/constants/document';

import styles from './FileFolderCell.scss';

const FileFolderCell = ({ cellData, currentEditId, resetEditId }) => {
  const { title, docId, displayType, folderName, folderId, status } = cellData;

  const isErred = status === documentConstants.STATUSES.ERRED;

  useEffect(() => {
    return () => {
      resetEditId();
    };
  }, []);

  let name = '';
  let icon = null;

  switch (displayType) {
    case 'folder':
      name = folderName;
      icon = <Folder />;
      break;
    case 'files':
      name = title;
      icon = <Page />;
      break;
    default:
      name = title;
      icon = <Page />;
      break;
  }

  if (
    currentEditId &&
    (currentEditId === folderId || currentEditId === docId)
  ) {
    return (
      <div className={styles.fieldName}>
        <span className={styles.fieldName_icon}>
          {displayType === 'folder' ? <Folder /> : <Page />}
        </span>
        <RenameFileFolderBox displayType={displayType} originalValue={name} />
      </div>
    );
  } else {
    return (
      <div className={styles.fieldName}>
        <span className={styles.fieldName_icon}>{icon}</span>
        <span className={styles.fieldName_text} title={name}>
          {name}
        </span>
      </div>
    );
  }
};

export default FileFolderCell;
