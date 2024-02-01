import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { Cancel, HeadsetHelp, MailOut } from 'iconoir-react';
import { isEmpty } from 'lodash';
import { updateConfigFlags } from 'new/api';
import { ReactComponent as CreditIcon } from 'new/assets/images/icons/icon-credit.svg';
import { SALES_ORIGIN_KEYS } from 'new/components/contexts/trackingConstants';
import HubspotMeetingPopup from 'new/components/modals/hubspot';
import { ACCOUNT_TYPES, USER_TYPES } from 'new/constants';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import IconButton, {
  SIZE,
  VARIANT,
} from 'new/ui-elements/IconButton/IconButton';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';

import styles from './CreditUtilizationTooltip.scss';

const CreditUtilizationTooltip = ({
  children,
  accountType,
  showLowCredit75Popup,
  showLowCredit85Popup,
  toggleShowCreditUtilizationModal,
  user,
  appActions,
}) => {
  const isFreeUser = accountType === ACCOUNT_TYPES.FREE;

  const { role } = user;

  const isUserAdminOwner =
    role === USER_TYPES.admin || role === USER_TYPES.owner;

  const [showTooltip, setShowTooltip] = useState(false);

  const [isHupspotMeetingPopupOpen, setIsHupspotMeetingPopupOpen] =
    useState(false);

  useEffect(() => {
    setShowTooltip(showLowCredit75Popup || showLowCredit85Popup);
  }, [showLowCredit75Popup, showLowCredit85Popup]);

  const mixpanelTracking = () => {
    if (isFreeUser) {
      mixpanelTrackingAllEvents(
        MIXPANEL_EVENTS.creditutilization_contactsales,
        { origin: 'Credit Utilization Notification' }
      );
    } else if (isUserAdminOwner) {
      mixpanelTrackingAllEvents(
        MIXPANEL_EVENTS.creditutilization_requestcredits,
        { origin: 'Credit Utilization Notification' }
      );
    } else {
      mixpanelTrackingAllEvents(MIXPANEL_EVENTS.creditutilization_notifyadmin, {
        origin: 'Credit Utilization Notification',
      });
    }
  };

  const handleCtaClick = async () => {
    mixpanelTracking();
    if (isFreeUser) {
      setIsHupspotMeetingPopupOpen(true);

      appActions.setLocalConfigFlags({
        showLowCredit85Popup: false,
        showLowCredit75Popup: false,
      });
      appActions.setConfigFlags({
        showLowCredit85Popup: false,
        showLowCredit75Popup: false,
      });
    } else {
      toggleShowCreditUtilizationModal();
    }
  };

  const handleContactSalesPopupClose = () => {
    setIsHupspotMeetingPopupOpen(false);
  };

  const handleTooltipClose = async () => {
    setShowTooltip(false);
    const payload = {
      ...(showLowCredit75Popup && { show_low_credit_75_popup: false }),
      ...(!showLowCredit75Popup &&
        showLowCredit85Popup && { show_low_credit_85_popup: false }),
    };
    if (!isEmpty(payload)) {
      await updateConfigFlags({
        payload,
      });
      appActions.setLocalConfigFlags({
        ...(showLowCredit75Popup && { showLowCredit75Popup: false }),
        ...(showLowCredit85Popup && { showLowCredit85Popup: false }),
      });
    }
  };

  let displayData = { ctaText: '', ctaIcon: '', heading: '', text: '' };

  let displayDataHeading = '';
  if (showLowCredit75Popup) {
    displayDataHeading = 'You have used 75% of your credits.';
  }
  if (showLowCredit85Popup && !isFreeUser) {
    displayDataHeading = 'You have used 85% of your credits.';
  }

  if (isFreeUser) {
    displayData = {
      ctaText: 'Contact Sales',
      ctaIcon: <HeadsetHelp />,
      heading: displayDataHeading,
      text: 'To purchase more credits, please get in touch with our sales team',
    };
  } else {
    if (isUserAdminOwner) {
      displayData = {
        ctaText: 'Request credits',
        ctaIcon: (
          <div className={styles.creditIcon}>
            <CreditIcon />
          </div>
        ),
        heading: displayDataHeading,
        text: 'Request credits below and our team will get in touch with you',
      };
    } else {
      displayData = {
        ctaText: 'Notify Admin',
        ctaIcon: <MailOut />,
        heading: displayDataHeading,
        text: 'Please notify your administrator to purchase more credits',
      };
    }
  }

  return (
    <>
      {children}
      <HubspotMeetingPopup
        user={user}
        isOpen={isHupspotMeetingPopupOpen}
        handleClose={handleContactSalesPopupClose}
        origin={SALES_ORIGIN_KEYS.creditUtilizationNotification}
      />
      {showTooltip ? (
        <span className={cx(styles.creditUtilizationTooltip__wrapper)}>
          <div className={styles.creditUtilizationTooltip__arrow}></div>
          <IconButton
            onClick={handleTooltipClose}
            icon={<Cancel color='var(--ds-clr-gray-800)' />}
            size={SIZE.EXTRA_SMALL}
            variant={VARIANT.GHOST}
            className={styles.creditUtilizationTooltip__closeIcon}
          />
          <div className={styles.creditUtilizationTooltip}>
            <div className='text-sm font-semibold'>{displayData.heading}</div>
            <div className='text-xs mt-1'>{displayData.text}</div>
            <Button
              icon={displayData.ctaIcon}
              fluid={false}
              className={styles.creditUtilizationTooltip__cta}
              size={SIZE.SMALL}
              onClick={handleCtaClick}
            >
              {displayData.ctaText}
            </Button>
          </div>
        </span>
      ) : (
        ''
      )}
    </>
  );
};

const mapStateToProps = ({
  app: {
    config: {
      flags: { showLowCredit85Popup = false, showLowCredit75Popup = false },
      accountType,
    },
    user,
  },
}) => ({
  showLowCredit85Popup,
  showLowCredit75Popup,
  accountType,
  user,
});

function mapDispatchToProps(dispatch) {
  return {
    appActions: bindActionCreators(appActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreditUtilizationTooltip);
