import React from 'react';

import { ReactComponent as DocTypeEmptyIcon } from 'new/assets/images/icons/doc-type-empty.svg';

import styles from './DocumentListEmptyState.scss';

function DocumentListEmptyState({ show = false }) {
  if (!show) {
    return null;
  }
  return (
    <div className={styles.container}>
      <div className={styles.image}>
        <DocTypeEmptyIcon />
      </div>
      <p>
        <span className={styles.text__main}>No active document type</span>
        <span className={styles.text__sub}>
          Enable the existing document type or add a new one to start afresh.
        </span>
      </p>
    </div>
  );
}

export default DocumentListEmptyState;
