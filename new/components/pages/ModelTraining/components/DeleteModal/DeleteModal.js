import React, { useState } from 'react';

import cx from 'classnames';
import { Cancel, Trash } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Modal from 'new/ui-elements/Modal/Modal';

import { refactorTitle } from '../../utils/utils';

import styles from './DeleteModal.scss';

const DeleteModel = ({
  confirmModal,
  onProceedActionBtnClick,
  onCancelActionBtnClick,
  deletingModelDetails,
  config,
}) => {
  const DELETE_STRING = 'DELETE MODEL';

  const [disButton, setDisableButton] = useState('');
  const [nameValueList, setNameValueList] = useState(refactorTitle(config));

  const handleDeleteAction = (e) => {
    setDisableButton(e.target.value);
  };

  return (
    <Modal
      onCloseHandler={onCancelActionBtnClick}
      show={confirmModal}
      size='sm'
      className={styles.confirmModal}
    >
      <div className={styles.confirmModal__header}>
        <p className='heading-6 font-weights-bold'>Delete model</p>
        <div className={styles['confirmModal__header--close']}>
          <IconButton
            icon={<Cancel height={24} width={24} />}
            className='ml-4'
            variant='ghost'
            onClick={onCancelActionBtnClick}
          />
        </div>
      </div>
      <div className={cx(styles.confirmModal__body, 'mt-6')}>
        <p>
          Are you sure you want to delete this model? Deleting this model will
          effect the accuracy of the linked document types and once deleted you
          will not be able to recover it.
        </p>
        <div className={cx(styles['confirmModal__body--box'], 'mt-6')}>
          {deletingModelDetails.map((item, index) => {
            return (
              <div className={styles['confirmModal__body--box2']} key={index}>
                <p>{item.modelTagVerbose}</p>
                <ul>
                  {item.linkedTo.map((docType, subIndex) => {
                    return <li key={subIndex}>{nameValueList[docType]}</li>;
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <div className={cx(styles['confirmModal__body--delete'], 'mt-6')}>
          Type “DELETE MODEL” to confirm
        </div>
        <Input
          className={cx(styles['confirmModal__body--input'], 'mt-2')}
          name='name'
          type='text'
          placeholder='DELETE MODEL'
          value={disButton}
          onChange={(e) => handleDeleteAction(e)}
        />
      </div>
      <div className={cx(styles.confirmModal__footer, 'mt-6')}>
        <Button
          className={styles.cancelBtn}
          onClick={onCancelActionBtnClick}
          variant='outlined'
          size='small'
        >
          Cancel
        </Button>
        <Button
          disabled={disButton !== DELETE_STRING}
          icon={Trash}
          colorScheme='danger'
          onClick={() => {
            setDisableButton('');
            onProceedActionBtnClick();
          }}
          size='small'
          className={cx('ml-4')}
        >
          Delete Model
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModel;
