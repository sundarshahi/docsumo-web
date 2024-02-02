import React, { useEffect, useState } from 'react';

import cx from 'classnames';
import Button from 'new/ui-elements/Button/Button';
import Modal from 'new/ui-elements/Modal/Modal';

import styles from './RedirectLoginModal.scss';

function RedirectLoginModal() {
  const [isModalShow, setModalShow] = useState(false);
  const handleLoginBtnClick = () => {
    global.window.location = '/login/';
  };

  useEffect(() => {
    setModalShow(true);
  }, []);

  return (
    <Modal
      show={isModalShow}
      className={styles.redirectModal}
      size='sm'
      animation='fade'
    >
      <div className={styles.redirectModal__header}>
        <p className='heading-6 font-weights-bold'>Password Changed</p>
      </div>
      <p className={cx(styles.redirectModal__body)}>
        Password changed successfully. Please login to continue
      </p>
      <div className={styles.redirectModal__btn}>
        <Button size='small' variant='contained' onClick={handleLoginBtnClick}>
          Redirect to Login
        </Button>
      </div>
    </Modal>
  );
}

export default RedirectLoginModal;
