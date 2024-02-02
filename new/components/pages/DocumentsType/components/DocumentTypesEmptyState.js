import React from 'react';

import { ReactComponent as EmptyIcon } from 'new/assets/images/icons/no_access_doc_types_logo.svg';

import styles from './DocumentTypesEmptyState.scss';

function DocumentTypesEmptyState() {
  return (
    <div className='d-flex justify-content-center w-100'>
      <div className={styles.content}>
        <EmptyIcon />
        <p className='font-black mt-4'>No Access</p>
        <p className={styles.content__label}>
          You don't have permission to access the Document Type. Please contact
          admin.
        </p>
      </div>
    </div>
  );
}

export default DocumentTypesEmptyState;
