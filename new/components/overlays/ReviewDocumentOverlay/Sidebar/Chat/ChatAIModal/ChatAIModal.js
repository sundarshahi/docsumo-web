import React, { useState } from 'react';
import { connect } from 'react-redux';
import { actions as appActions } from 'new/redux/app/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import _ from 'lodash';
import mixpanel from 'mixpanel-browser';
import { enableChatAI, requestChatAI, updateConfigFlags } from 'new/api';
import chatAIModalImg from 'new/assets/images/chatai-modal-img.jpg';
import { CHATAI_MODAL_TYPE } from 'new/constants';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';
import Modal from 'new/ui-elements/Modal/Modal';

import styles from './ChatAIModal.scss';

const ChatAIModal = ({
  showModal,
  appActions,
  resetTabChange,
  email,
  mode,
  orgId,
  canSwitchToOldMode,
  type,
  role,
}) => {
  const [agreeCheckbox, setAgreeCheckbox] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const acceptEnableChatAI = async () => {
    try {
      setLoading(true);
      const response = await enableChatAI();
      const message = _.get(response.responsePayload, 'message');
      appActions.setChatAIPopup({ chataiPopupSeen: true });
      appActions.setChatAIEnabled({ chataiEnabled: true });
      appActions.setToast({
        title: message || 'Successfully accepted policy!',
        success: true,
      });
      trackMixpanelEvents(MIXPANEL_EVENTS.accept_policy_chat_ai);
    } catch (e) {
      appActions.setToast({
        title: 'Something went wrong!',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const requestEnableChatAI = async () => {
    try {
      setLoading(true);
      const response = await requestChatAI();

      const message = response?.responsePayload?.message;

      appActions.setChatAIPopup({ chataiRequestSent: true });
      appActions.setToast({
        title: message || 'Successfully sent request!',
        success: true,
      });
      trackMixpanelEvents(MIXPANEL_EVENTS.request_access_chat_ai);
    } catch (e) {
      appActions.setToast({
        title: 'Something went wrong!',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const seenChatAIPopup = async () => {
    try {
      setLoading(true);
      await updateConfigFlags({
        payload: {
          chatai_popup_seen: true,
        },
      });
      appActions.setChatAIPopup({ chataiPopupSeen: true });
    } catch (e) {
      appActions.setToast({
        title: 'Something went wrong!',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitButton = () => {
    if (showModal === CHATAI_MODAL_TYPE.ACCEPT_REQUEST) {
      acceptEnableChatAI();
    } else if (showModal === CHATAI_MODAL_TYPE.REQUEST_ACCESS) {
      requestEnableChatAI();
    } else {
      seenChatAIPopup();
    }
  };

  const trackMixpanelEvents = (evt) => {
    mixpanel.track(evt, {
      'work email': email,
      'organization ID': orgId,
      mode: mode,
      version: 'new',
      canSwitchUIVersion: canSwitchToOldMode,
      docType: type,
      role,
    });
  };

  return (
    <div>
      <Modal
        onCloseHandler={resetTabChange}
        show={!!showModal}
        animation='fade'
        size='sm'
        className={styles.ChatAIModal}
      >
        <div className={styles.ChatAIModal__img}>
          <img src={chatAIModalImg} alt='Chat AI' />
        </div>
        <div className={styles.ChatAIModal__body}>
          <div className={styles.ChatAIModal__title}>Welcome to Chat AI</div>
          <div className={cx(styles.ChatAIModal__desc, 'mt-1')}>
            We're excited to introduce you to an intelligent and interactive
            Chat AI for interacting with your documents! Ask questions, get
            summaries, find information, and much more.
          </div>
          {showModal === CHATAI_MODAL_TYPE.ACCEPT_REQUEST && (
            <>
              <div className={styles['ChatPrivacyPolicy__terms-box']}>
                <p className={styles['ChatPrivacyPolicy__terms-header']}>
                  Terms and conditions
                </p>
                <p className={styles['ChatPrivacyPolicy__terms-body']}>
                  This Privacy Policy outlines how we handle the data collected
                  through our Chat AI feature and the steps we take to ensure
                  its protection
                </p>
                <ol className={styles['ChatPrivacyPolicy__terms-list']}>
                  <li>
                    <span>Data Sharing:</span> We want to assure you that we do
                    not share your data with any third parties. Any information
                    you provide while using our Chat AI feature is treated as
                    confidential and is solely used to improve your user
                    experience.
                  </li>
                  <li>
                    <span>Data Usage:</span> It is important to note that the
                    data you share with our Chat AI feature is not used to train
                    the model. We respect your privacy and understand the
                    sensitivity of the information exchanged during
                    conversations. We have implemented measures to prevent any
                    unauthorised access to your data and ensure that it is used
                    solely for the purpose of providing you with the best
                    possible assistance.
                  </li>
                  <li>
                    <span>Data Security:</span>We employ industry-standard
                    security measures to protect your data from unauthorized
                    access, loss, or alteration. Our systems are designed to
                    safeguard the confidentiality and integrity of your
                    information. However, please be aware that no method of data
                    transmission or storage can be guaranteed to be 100% secure.
                  </li>
                  <li>
                    <span>Data Control:</span>We believe in giving you control
                    over your personal information. You have the right to
                    access, update, and delete any personal data shared with
                    Chat AI. If you wish to exercise these rights or have any
                    concerns regarding your privacy, please contact us using the
                    information provided at the end of this Privacy Policy
                  </li>
                </ol>
                <br />
                <p className={styles.ChatPrivacyPolicy__helperText}>
                  If you have any questions or concerns regarding our Privacy
                  Policy or the data we collect, please contact us at
                  "success@docsumo.com". We are committed to addressing any
                  inquiries promptly and transparently.
                </p>
                <br />
                <p className={styles.ChatPrivacyPolicy__helperText}>
                  By using our Chat AI feature, you acknowledge that you have
                  read and understood this Privacy Policy and consent to the
                  collection, use, and storage of your data as described herein.
                </p>
              </div>
              <div className={styles.ChatPrivacyPolicy__checkbox}>
                <Checkbox
                  checked={agreeCheckbox}
                  name='agreeCheckbox'
                  onChange={() => setAgreeCheckbox(!agreeCheckbox)}
                />
                <p
                  className={cx(
                    'ml-2',
                    styles['ChatPrivacyPolicy__accept-texts']
                  )}
                >
                  I accept the terms and conditions
                </p>
              </div>
            </>
          )}

          {showModal === CHATAI_MODAL_TYPE.ACCESS_REQUESTED ? (
            <p className={styles.ChatAIModal__banner}>
              You have already sent a request to the workspace admin. Please
              contact your workspace admin.
            </p>
          ) : (
            <div className={styles.ChatPrivacyPolicy__btns}>
              {showModal === CHATAI_MODAL_TYPE.ACCEPT_REQUEST ||
              showModal === CHATAI_MODAL_TYPE.REQUEST_ACCESS ? (
                <Button
                  size='small'
                  onClick={resetTabChange}
                  variant='outlined'
                >
                  {showModal === CHATAI_MODAL_TYPE.REQUEST_ACCESS
                    ? 'No Thanks'
                    : 'Cancel'}
                </Button>
              ) : null}

              <Button
                disabled={
                  showModal === CHATAI_MODAL_TYPE.ACCEPT_REQUEST
                    ? !agreeCheckbox || isLoading
                    : isLoading
                }
                size='small'
                onClick={handleSubmitButton}
                variant='contained'
                colorScheme='primary'
                className='ml-4'
                isLoading={isLoading}
              >
                {showModal === CHATAI_MODAL_TYPE.REQUEST_ACCESS
                  ? 'Please ask your admin for Chat AI'
                  : 'Proceed to use Chat AI'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { app } = state;

  const { documentsById, docId } = state.documents.reviewTool;

  const docMeta = documentsById[docId] || null;

  return {
    email: app?.user?.email,
    orgId: app?.user?.orgId,
    mode: app?.user?.mode,
    type: docMeta?.type,
    role: app?.user?.role,
    canSwitchToOldMode: app?.config?.canSwitchToOldMode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return { appActions: bindActionCreators(appActions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatAIModal);
