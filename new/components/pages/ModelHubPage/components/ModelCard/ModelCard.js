/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { ArrowRight, PageFlip } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import HubspotMeetingPopup from 'new/components/modals/hubspot';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badge from 'new/ui-elements/Badge';

import styles from './modelCard.scss';

const ModelCard = ({
  item = {},
  colorArray = [],
  handleDocumentType = null,
  isCustom = false,
  config,
  user,
}) => {
  const defaultBgColor = '#EFF1F9';
  const { icon = null, name = '', content = '', index = 0, apiDoc = '' } = item;
  const customName = 'Train New Document Type';
  const customSubtitle =
    'Develop a personalized document type to meet your specific requirements and train the system to extract data from it.';
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showHubSpotMeetingPopUp, setShowHubSpotMeetingPopUp] = useState(false);

  const handleHubSpotMeetingPopUpClose = () => {
    setShowHubSpotMeetingPopUp(false);
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    window.open(isCustom ? SUPPORT_LINK.API_DOC_LINK : apiDoc, '_blank');
  };

  const handleTooltipControl = () => {
    setIsTooltipVisible(!isTooltipVisible);
    setTimeout(() => {
      setIsTooltipVisible(false);
    }, 5000);
  };

  const handleContactSalesClick = () => {
    appActions.hideDarkOverlay();
    documentActions.displaySelectDocumentTypeModal(false);
    setShowHubSpotMeetingPopUp(true);
    const { canSwitchToOldMode = true } = config;

    // Add mixpanel event
    mixpanel.track(MIXPANEL_EVENTS.contact_sales_start, {
      'work email': user?.email,
      'organization ID': user?.orgId,
      origin: 'Custom document type',
      version: 'new',
      mode: user?.mode,
      canSwitchUIVersion: canSwitchToOldMode,
    });
  };

  return (
    <div
      className={styles.card}
      onClick={() =>
        isCustom
          ? handleDocumentType({ type: 'custom' })
          : handleDocumentType(item)
      }
    >
      <div className={styles.title}>
        <span className={styles['title__icon-container']}>
          <span
            className={styles.title__falsediv}
            style={{
              backgroundColor: isCustom
                ? colorArray[0]
                : colorArray[index % 6] || defaultBgColor,
            }}
          ></span>
          <span className={styles.title__icon}>
            {isCustom ? <PageFlip /> : icon}
          </span>
        </span>
        <span
          className={cx(styles.title__name, 'ellipsis')}
          title={isCustom ? customName : name}
        >
          {isCustom ? customName : name}
        </span>
      </div>
      <div className={styles.cardsubtitle}>
        {isCustom ? customSubtitle : content}
        <span onClick={handleLinkClick}>Learn More</span>
      </div>
      <div className={styles.cardcta}>
        <Badge
          className={cx(styles.cardcta__tag, 'cursor-pointer')}
          title='Use'
          type='primary'
          iconDirection='right'
          iconClassName={styles['cardcta__tag--icon']}
          onClick={(e) => {
            e.stopPropagation();
            if (isCustom) {
              handleDocumentType({ type: 'custom' });
            } else {
              handleDocumentType(item);
            }
          }}
          CustomIcons={<ArrowRight width={16} height={16} strokeWidth={2} />}
          size='lg'
        />
      </div>
      <HubspotMeetingPopup
        isOpen={showHubSpotMeetingPopUp}
        user={user}
        handleClose={handleHubSpotMeetingPopUpClose}
      />
    </div>
  );
};

function mapDispatchToProps(dispatch) {
  return {
    documentActions: bindActionCreators(documentActions, dispatch),
    appActions: bindActionCreators(appActions, dispatch),
  };
}

function mapStateToProp(state) {
  const { config, user } = state.app;
  return {
    config,
    user,
  };
}

export default connect(mapStateToProp, mapDispatchToProps)(ModelCard);
