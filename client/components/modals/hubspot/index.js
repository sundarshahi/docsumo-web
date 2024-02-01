import React from 'react';

import cx from 'classnames';
import { MIXPANEL_EVENTS } from 'client/thirdParty/mixpanel';
import { getFirstAndLastName } from 'client/utils/textUtils';
import mixpanel from 'mixpanel-browser';
import Modal from 'react-responsive-modal';

import styles from './hubspotMeeting.scss';

const HUBSPOT_EMBED_URL =
  'https://meetings.hubspot.com/docsumo-team/signup-discovery-call?embed=true';

function getIframeUrl(user = {}) {
  const { fullName = '', email = '', companyName = '' } = user;

  const name = getFirstAndLastName(fullName);

  const data = {
    firstName: name.firstName,
    lastName: name.lastName,
    email,
    company: companyName,
  };

  let queryParams = '';

  // eslint-disable-next-line no-unused-vars
  for (const key in data) {
    const keyVal = data[key];
    const val = keyVal ? keyVal.replace(' ', '%20') : '';
    queryParams += `&${key}=${val}`;
  }

  return HUBSPOT_EMBED_URL + queryParams;
}

function HubspotMeetingPopup(props) {
  const {
    className,
    user = {},
    isOpen,
    handleClose,
    isNewUser = false,
    title = 'Schedule Demo',
  } = props;

  const onCloseModal = () => {
    if (!isNewUser) {
      mixpanel.track(MIXPANEL_EVENTS.contact_sales_close, {
        'work email': user.email,
      });
    }
    handleClose();
  };

  return (
    <Modal
      classNames={{
        modal: cx(styles.modal, className),
        closeButton: styles.closeButton,
      }}
      open={isOpen}
      center={true}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      onOverlayClick={onCloseModal}
      onClose={onCloseModal}
    >
      <div className={styles.modalHeading}>
        <h1>{title}</h1>
      </div>
      <div className={styles.modalContent}>
        <iframe
          name='hubspotMeeting'
          title='Hubspot meeting form'
          src={getIframeUrl(user)}
        ></iframe>
      </div>
    </Modal>
  );
}

export default HubspotMeetingPopup;
