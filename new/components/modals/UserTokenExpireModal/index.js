import React from 'react';
import { connect } from 'react-redux';

import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'new/components/shared/Modal';
import Button, { SIZE, VARIANT } from 'new/ui-elements/Button/Button';

import styles from './index.scss';

function UserTokenExpiredModal(props) {
  const { user, tokenExpired } = props;
  // eslint-disable-next-line compat/compat
  const parsedUrl = new URL(window.location.href);
  const token = parsedUrl.searchParams.get('token');
  if (!user || !tokenExpired) {
    return null;
  } else if (token) {
    window.open('https://docsumo.com/link-expired', '_top');
    return null;
  }

  const handleLoginBtnClick = () => {
    global.window.location = '/login/';
  };

  return (
    <Modal
      className={styles.root}
      rootProps={{
        titleText: 'Session Expired',
      }}
    >
      <ModalHeader title='Session Expired' showCloseBtn={false} />

      <ModalContent>
        <p>
          Looks like your session has expired. Please login again to continue
          working.
        </p>
      </ModalContent>

      <ModalFooter className={styles.footer}>
        <Button
          variant={VARIANT.CONTAINED}
          size={SIZE.SMALL}
          title='Login Again'
          onClick={handleLoginBtnClick}
        >
          Login Again
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function mapStateToProps(state) {
  const { user, tokenExpired } = state.app;

  return {
    user,
    tokenExpired,
  };
}

export default connect(mapStateToProps)(UserTokenExpiredModal);
