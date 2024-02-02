import React from 'react';

import { Cancel } from 'iconoir-react';
import _ from 'lodash';
import Button from 'new/ui-elements/Button/Button';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Modal from 'new/ui-elements/Modal';

import styles from './AuditLogModal.scss';

const AuditLogModal = (props) => {
  const { title, onCloseBtnClick, data } = props;

  return (
    <Modal
      show={true}
      onCloseHandler={(e) => {
        e.stopPropagation();
        onCloseBtnClick();
      }}
      className={styles.modal}
    >
      <div className={styles.header}>
        <h1 className={styles.heading} title={title}>
          {title}
        </h1>
        <div className={styles.header_iconsContainer}>
          <IconButton
            icon={<Cancel height={24} width={24} />}
            className='ml-4'
            variant='ghost'
            onClick={onCloseBtnClick}
          />
        </div>
      </div>
      <div className={styles.body}>
        {_.isEmpty(data) ? (
          <div className={styles.emptyState}>No activities to show!</div>
        ) : (
          <>
            <p className={(styles.text__main, 'font-medium')}>Activity</p>
            <ul className={styles.list}>
              {data.map((item, idx) => {
                let nameArray = item.name && item.name.split(' ');
                let firstInitial = _.isEmpty(nameArray)
                  ? 'U'
                  : nameArray[0].substring(0, 1).toUpperCase();

                return (
                  <li key={idx}>
                    <div className={styles.userIcon}>{firstInitial}</div>
                    <div className={styles.details}>
                      <p>{item.action}</p>
                      <p>{item.dateTime}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
      <div className={styles.footer}>
        <Button size={'small'} variant={'contained'} onClick={onCloseBtnClick}>
          OK
        </Button>
      </div>
    </Modal>
  );
};

export default AuditLogModal;
