import React from 'react';

import cx from 'classnames';
import mixpanel from 'mixpanel-browser';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import { getFirstAndLastName } from 'new/utils/textUtils';
import queryString from 'query-string';
import Modal from 'react-responsive-modal';

import styles from './hubspotMeeting.scss';

const HUBSPOT_EMBED_URL =
  'https://meetings.hubspot.com/docsumo-team/signup-discovery-call?embed=true';

function getIframeUrl(user = {}, origin) {
  const { fullName = '', email = '', companyName = '' } = user;

  const name = getFirstAndLastName(fullName);

  const data = {
    firstName: name.firstName,
    lastName: name.lastName,
    email,
    company: companyName,
    origin: origin,
  };

  return `${HUBSPOT_EMBED_URL}${queryString.stringify(data)}`;
}

function HubspotMeetingPopup(props) {
  const {
    className,
    user = {},
    isOpen,
    handleClose,
    isNewUser = false,
    title = 'Book a Call',
    origin = 'Unknown',
  } = props;

  const onCloseModal = () => {
    if (!isNewUser) {
      mixpanel.track(MIXPANEL_EVENTS.contact_sales_close, {
        'work email': user.email,
        version: 'new',
      });
    }
    handleClose();
  };

  return (
    <Modal
      classNames={{
        overlay: styles.modalOverlay,
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
          src={user ? getIframeUrl(user, origin) : ''}
        ></iframe>
      </div>
    </Modal>
  );
}

export default HubspotMeetingPopup;
