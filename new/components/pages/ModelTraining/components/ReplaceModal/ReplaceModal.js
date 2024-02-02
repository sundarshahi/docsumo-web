import React from 'react';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import _ from 'lodash';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal/Modal';

import { filterEnabledPayload } from '../../utils/utils';

import styles from './ReplaceModal.scss';

const ReplaceModal = ({
  confirmModal,
  onProceedActionBtnClick,
  onCancelActionBtnClick,
  initDoctype,
  finalDoctype,
  modelTagVerbose,
  nameValueList,
  isReplaceModelLoading,
}) => {
  return (
    <Modal
      onCloseHandler={onCancelActionBtnClick}
      show={confirmModal}
      size='sm'
      className={styles.confirmModal}
    >
      <div className={styles.confirmModal__header}>
        <p className='heading-6 font-weights-bold'>Replace Model</p>
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
          Are you sure you want to replace theses model linked to the document
          type? Replacing these models will effect the accuracy of the linked
          document types.
        </p>
        <div className={cx(styles['confirmModal__body--box'], 'mt-6')}>
          <div>
            <div className={styles['confirmModal__body--box2']}>
              <p>{modelTagVerbose} is currently linked to</p>
              {!_.isEmpty(initDoctype) ? (
                <ul>
                  {Object.entries(initDoctype).map((docType, subIndex) => {
                    return <li key={subIndex}>{nameValueList[docType[0]]}</li>;
                  })}
                </ul>
              ) : (
                <ul>
                  <li>None</li>
                </ul>
              )}
            </div>
            <div className={styles['confirmModal__body--box2']}>
              <p>{modelTagVerbose} will be replaced to</p>
              {!_.isEmpty(filterEnabledPayload(finalDoctype)) ? (
                <ul>
                  {Object.entries(filterEnabledPayload(finalDoctype)).map(
                    (docType, subIndex) => {
                      return (
                        <li key={subIndex}>{nameValueList[docType[0]]}</li>
                      );
                    }
                  )}
                </ul>
              ) : (
                <ul>
                  <li>None</li>
                </ul>
              )}
            </div>
          </div>
        </div>
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
          variant='contained'
          onClick={onProceedActionBtnClick}
          size='small'
          className={cx('ml-4')}
          isLoading={isReplaceModelLoading}
        >
          Replace
        </Button>
      </div>
    </Modal>
  );
};

export default ReplaceModal;
