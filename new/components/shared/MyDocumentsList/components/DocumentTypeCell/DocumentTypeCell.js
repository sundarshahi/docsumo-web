import React from 'react';

import { InfoEmpty } from 'iconoir-react';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip';

import styles from './DocumentTypeCell.scss';

const DocumentTypeCell = ({
  cellData,
  documentTypes,
  onDocumentActionChange,
}) => {
  const { type, displayType, docId } = cellData;
  const docType =
    documentTypes.find((i) => i.value === type)?.title || 'Others';

  const handlePreviewFileClick = (e) => {
    e.stopPropagation();
    onDocumentActionChange('view', docId);
  };

  return (
    <div className={styles.typeCell}>
      {displayType !== 'folder' && (
        <>
          <Tooltip label='Preview File' placement='top'>
            <IconButton
              size='small'
              variant='text'
              icon={<InfoEmpty color='var(--ds-clr-gray-800)' />}
              className={styles.iconBtn}
              onClick={handlePreviewFileClick}
            />
          </Tooltip>
          <span className={styles.typeCell_text} title={docType}>
            {docType}
          </span>
        </>
      )}
    </div>
  );
};

export default DocumentTypeCell;
