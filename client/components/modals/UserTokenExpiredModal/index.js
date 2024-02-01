import React from 'react';
import { connect } from 'react-redux';

import Modal, {
  ModalContent,
  ModalFooter,
  ModalHeader,
} from 'components/shared/Modal';
import {
  APPEARANCES as BUTTON_APPEARANCES,
  Button,
} from 'components/widgets/buttons';

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
          Looks like your session has expired. Please log in again to continue
          working.
        </p>
      </ModalContent>

      <ModalFooter className={styles.footer}>
        <Button
          text='Login Again'
          appearance={BUTTON_APPEARANCES.PRIMARY}
          onClick={handleLoginBtnClick}
        />
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
