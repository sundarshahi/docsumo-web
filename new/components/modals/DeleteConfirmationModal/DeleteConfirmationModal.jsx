import React from 'react';

import cx from 'classnames';
import { Cancel, Trash } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';

function DeleteConfirmationModal({
  show,
  modalTitle = 'Delete Section',
  modalBody = 'Are you sure you want to delete this section?',
  className,
  onCloseHandler,
  isLoading,
  handleDeleteBtnClick,
}) {
  return (
    <Modal
      show={show}
      className={cx('p-6', className)}
      onCloseHandler={onCloseHandler}
    >
      <div className='d-flex justify-content-between align-items-center'>
        <h6 className='heading-6 mr-4'>{modalTitle}</h6>
        <IconButton icon={Cancel} variant='ghost' onClick={onCloseHandler} />
      </div>
      <div className='my-6 text-md'>{modalBody}</div>
      <div className='d-flex justify-content-end'>
        <Button
          variant='outlined'
          size='small'
          className='mr-4'
          onClick={onCloseHandler}
        >
          Cancel
        </Button>
        <Button
          icon={Trash}
          size='small'
          colorScheme='danger'
          disabled={isLoading}
          isLoading={isLoading}
          onClick={handleDeleteBtnClick}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
}

export default DeleteConfirmationModal;
