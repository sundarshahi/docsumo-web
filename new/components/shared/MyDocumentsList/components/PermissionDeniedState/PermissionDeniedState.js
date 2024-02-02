import React from 'react';

import { ReactComponent as EmptyIcon } from 'new/assets/images/icons/no_access_doc_types_logo.svg';

import styles from './PermissionDeniedState.scss';

function PermissionDeniedState() {
  return (
    <div>
      <div className={styles.content}>
        <EmptyIcon />
        <p className='font-black mt-4'>No Access</p>
        <p className={styles.content__label}>
          You don't have permission to access the My Documents. Please contact
          admin.
        </p>
      </div>
    </div>
  );
}

export default PermissionDeniedState;
