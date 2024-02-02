import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { chatAIActions } from 'new/redux/chatai/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { bindActionCreators } from 'redux';

import mixpanel from 'mixpanel-browser';
import { CHATAI_MODAL_TYPE } from 'new/constants';
import { USER_ROLES } from 'new/constants/userRoles';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';

import ChatAIModal from './ChatAIModal/ChatAIModal';
import ChatBox from './ChatBox';
import ChatEmptyState from './ChatEmptyState';
import ChatSkeleton from './ChatSkeleton';
import FeedbackBox from './FeedbackBox';
import MessageBubble from './MessageBubble';

import styles from './Chat.scss';

const POST_QUESTION_TIME_LIMIT = 15;

const Chat = ({
  chatAIActions,
  docId,
  chatAI,
  chataiPopupSeen,
  role,
  chataiRequestSent,
  chataiEnabled,
  documentActions,
  email,
  orgId,
  mode,
  canSwitchToOldMode,
  type,
}) => {
  const [showTakingLongMessage, setShowTakingLongMessage] = useState(false);
  const [selectedPageNumber, setSelectedPageNumber] = useState(null);

  const messageContainerRef = useRef(null);
  const postQuestionInterval = useRef(null);
  const firstRenderRef = useRef(true);
  const [showModal, setShowModal] = useState(null); // request-access | access-requested | welcome | accept-request

  useEffect(() => {
    return () => {
      documentActions.updateChatAIBboxes({ bboxes: [] });
      chatAIActions.resetChatAIAPIState();
      clearInterval(postQuestionInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    documentActions.rtSetSelectedFieldId({
      sectionFieldId: null,
      sidebarItemId: null,
      lineItemRowId: null,
      fieldId: null,
      lineItemFooterBtn: null,
    });

    if (!chataiEnabled || !chataiPopupSeen) return;

    chatAIActions.fetchChatAIHistory({ docId: docId });
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId, chataiEnabled, chataiPopupSeen]);

  useEffect(() => {
    if (
      chatAI.postQuestion.status === 'success' ||
      chatAI.postQuestion.status === 'loading' ||
      chatAI.fetchHistory.status === 'success'
    ) {
      scrollToBottom();
    }

    if (chatAI.postQuestion.status === 'loading') {
      let postCount = 1;
      postQuestionInterval.current = setInterval(() => {
        postCount++;
        if (postCount > POST_QUESTION_TIME_LIMIT) {
          setShowTakingLongMessage(true);
        }
      }, 1000);
    }

    if (
      chatAI.postQuestion.status === 'success' ||
      chatAI.postQuestion.status === 'failed'
    ) {
      clearInterval(postQuestionInterval.current);
      postQuestionInterval.current = '';
      setShowTakingLongMessage(false);
    }
    if (chatAI.postQuestion.status === 'failed') {
      trackErrorMixpanelEvents(
        MIXPANEL_EVENTS.error_response_chat_ai,
        chatAI.postQuestion?.response?.message
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatAI.postQuestion.status, chatAI.fetchHistory.status]);

  useEffect(() => {
    const isAdminOrOwner =
      role === USER_ROLES.ADMIN || role === USER_ROLES.OWNER;

    let modalType = null;

    if (isAdminOrOwner) {
      if (!chataiEnabled) {
        modalType = CHATAI_MODAL_TYPE.ACCEPT_REQUEST;
      } else if (chataiEnabled && !chataiPopupSeen) {
        modalType = CHATAI_MODAL_TYPE.WELCOME;
      }
    } else {
      // MODERATOR | MEMBER Role
      if (!chataiEnabled && !chataiRequestSent) {
        modalType = CHATAI_MODAL_TYPE.REQUEST_ACCESS;
      } else if (!chataiEnabled && chataiRequestSent) {
        modalType = CHATAI_MODAL_TYPE.ACCESS_REQUESTED;
      } else if (chataiEnabled && !chataiPopupSeen) {
        modalType = CHATAI_MODAL_TYPE.WELCOME;
      }
    }

    setShowModal(modalType);
  }, [chataiPopupSeen, chataiRequestSent, chataiEnabled, role]);

  useEffect(() => {
    trackMixpanelEvents(MIXPANEL_EVENTS.view_chat_ai);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = () => {
    const containerHeight = messageContainerRef?.current?.scrollHeight;

    messageContainerRef.current.scrollTo({
      top: containerHeight,
      behavior: firstRenderRef.current ? 'instant' : 'smooth',
    });
    firstRenderRef.current = false;
  };

  const handleRetryButtonClick = () => {
    chatAIActions.postChatAIQuestion(chatAI.postQuestion.payload);
  };

  const resetTabChange = () => {
    documentActions.setActiveSidebarTab('extract');
    trackMixpanelEvents(MIXPANEL_EVENTS.cancel_policy_chat_ai);
  };

  const trackMixpanelEvents = (evt) => {
    mixpanel.track(evt, {
      'work email': email,
      'organization ID': orgId,
      mode: mode,
      version: 'new',
      role,
      canSwitchUIVersion: canSwitchToOldMode,
      docType: type,
    });
  };

  const trackErrorMixpanelEvents = (evt, msg) => {
    mixpanel.track(evt, {
      'work email': email,
      'organization ID': orgId,
      mode: mode,
      version: 'new',
      role,
      canSwitchUIVersion: canSwitchToOldMode,
      docType: type,
      error: msg,
    });
  };

  const changeSelectedPageNumber = (pageNumber) => {
    setSelectedPageNumber(pageNumber);
  };

  return (
    <div className={styles.container}>
      <div ref={messageContainerRef} className={styles.messageContainer}>
        {chatAI?.fetchHistory.status === 'fetching' ? <ChatSkeleton /> : null}

        {chatAI.fetchHistory.status !== 'fetching' && chatAI.chats.length ? (
          <div className='mt-auto'>
            {chatAI.chats.map((chat) => (
              <MessageBubble
                key={chat.id}
                chat={chat}
                changeSelectedPageNumber={changeSelectedPageNumber}
                selectedPageNumber={selectedPageNumber}
              />
            ))}
          </div>
        ) : null}

        {chatAI.fetchHistory.status !== 'fetching' && !chatAI.chats.length ? (
          <ChatEmptyState />
        ) : null}

        {chatAI.postQuestion.status === 'loading' ? (
          <FeedbackBox
            showLoader
            showTakingLongMessage={showTakingLongMessage}
          />
        ) : null}
        {chatAI.postQuestion.status === 'failed' ? (
          <FeedbackBox
            showError
            handleRetryButtonClick={handleRetryButtonClick}
          />
        ) : null}
      </div>
      <ChatBox />
      <ChatAIModal
        chataiPopupSeen={chataiPopupSeen}
        chataiRequestSent={chataiRequestSent}
        resetTabChange={resetTabChange}
        showModal={showModal}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  const { chatAI, documents, app } = state;

  const { documentsById, docId } = state.documents.reviewTool;

  const docMeta = documentsById[docId] || null;
  return {
    chatAI,
    docId: documents?.reviewTool?.docId,
    chataiAccess: app?.config.chataiAccess,
    chataiEnabled: app?.config?.chataiEnabled,
    role: app?.user?.role,
    chataiPopupSeen: app?.config?.flags?.chataiPopupSeen,
    chataiRequestSent: app?.config?.flags?.chataiRequestSent,
    email: app?.user?.email,
    orgId: app?.user?.orgId,
    mode: app?.user?.mode,
    type: docMeta?.type,
    canSwitchToOldMode: app?.config?.canSwitchToOldMode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    chatAIActions: bindActionCreators(chatAIActions, dispatch),
    documentActions: bindActionCreators(documentActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
