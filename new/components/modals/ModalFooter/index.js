import React from 'react';

import Button from 'new/ui-elements/Button/Button';

import styles from './modalFooter.scss';
const ModalFooter = ({
  handleCloseModal,
  handleConfirm,
  loading,
  cancel,
  confirm,
}) => {
  return (
    <>
      <div className={styles.modalFooter}>
        <Button
          size='small'
          variant='outlined'
          onClick={handleCloseModal}
          className={styles.actionBtn}
        >
          {cancel}
        </Button>
        <Button
          size='small'
          variant='contained'
          onClick={handleConfirm}
          className={styles.actionBtn}
          isLoading={loading}
          disabled={loading}
        >
          {confirm}
        </Button>
      </div>
    </>
  );
};

export default ModalFooter;
