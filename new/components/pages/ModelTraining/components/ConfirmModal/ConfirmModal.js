import React from 'react';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import Button from 'new/ui-elements/Button/Button';
import Modal from 'new/ui-elements/Modal/Modal';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './ConfirmModal.scss';

const ConfirmModel = ({ toogleConfirmModal, show }) => {
  return (
    <div>
      <Modal
        onCloseHandler={toogleConfirmModal}
        animation='fade'
        show={show}
        size='sm'
        className={styles.deleteModal}
      >
        <div className={styles.deleteModal__header}>
          <p className='heading-6 font-weights-bold'>Model training started</p>
          <div className={styles['deleteModal__header--close']}>
            <Tooltip placement='bottom' label='Close Modal'>
              <div
                role='presentation'
                onClick={toogleConfirmModal}
                className={cx(styles.icon, 'cursor-pointer')}
              >
                <Cancel />
              </div>
            </Tooltip>
          </div>
        </div>
        <div className={cx(styles.deleteModal__body, 'mt-6')}>
          <div className={styles.deleteModal__banner}>
            <p>
              <span>Note:</span> Training a model can take 30 minutes to 4
              hours, depending on the number of samples and approved documents.
            </p>
          </div>
          <div className={cx(styles.deleteModal__list, 'mt-6', 'ml-6')}>
            <ul>
              <li>
                <p>
                  After the training is complete you can link the model to
                  document types.
                </p>
              </li>
              <li>
                <p>
                  Closing the window or changing the tab won’t effect the
                  training process.
                </p>
              </li>
            </ul>
          </div>
        </div>
        <div className={cx(styles.deleteModal__footer, 'mt-6')}>
          <Button
            variant='contained'
            size='small'
            onClick={toogleConfirmModal}
            className={styles['deleteModal__footer--btn']}
          >
            Ok
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ConfirmModel;
