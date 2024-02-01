import React from 'react';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';

function DeleteConfirmationModal({
  show,
  modalTitle,
  modalBody,
  className,
  handleModalClose,
  isLoading,
  handleConfirmBtnClick,
  cancelBtnLabel,
  confirmBtnLabel = 'Confirm',
  confirmBtnProps,
}) {
  return (
    <Modal
      show={show}
      className={cx('p-6', className)}
      onCloseHandler={handleModalClose}
      timeout={0}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <h6 className='heading-6 mr-4'>{modalTitle}</h6>
        <IconButton
          icon={Cancel}
          variant='ghost'
          onClick={(e) => {
            e.preventDefault();
            handleModalClose('title');
          }}
        />
      </div>
      <div className='my-6 text-md'>{modalBody}</div>
      <div className='d-flex justify-content-end'>
        {cancelBtnLabel && (
          <Button
            variant='outlined'
            size='small'
            className='mr-4'
            onClick={(e) => {
              e.preventDefault();
              handleModalClose('cancel');
            }}
          >
            {cancelBtnLabel}
          </Button>
        )}
        <Button
          size='small'
          colorScheme='primary'
          disabled={isLoading}
          isLoading={isLoading}
          onClick={handleConfirmBtnClick}
          {...confirmBtnProps}
        >
          {confirmBtnLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default DeleteConfirmationModal;
