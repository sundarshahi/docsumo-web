import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { chatAIActions } from 'new/redux/chatai/actions';
import { actions as documentActions } from 'new/redux/documents/actions';
import { showToast } from 'new/redux/helpers';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import copy from 'clipboard-copy';
import { Copy, Page, User } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { ReactComponent as DocsumoIcon } from 'new/assets/images/docsumo/icon.svg';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Button from 'new/ui-elements/Button/Button';
import IconButton, { VARIANT } from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import FeedbackBox from '../FeedbackBox/FeedbackBox';

import styles from './MessageBubble.scss';

const PAGINATION_LIMITER = 7;

const MessageBubble = ({
  chat,
  docId,
  chatAIActions,
  documentActions,
  chats,
  retryQuestion,
  postQuestion,
  docMeta,
  selectedPageNumber,
  changeSelectedPageNumber,
  email,
  orgId,
  canSwitchToOldMode,
  mode,
  role,
  type,
}) => {
  const [visiblePositions, setVisiblePositions] = useState([]);
  const [showMore, setShowMore] = useState(false);

  const positions = useMemo(
    () => Object.keys(chat.position ?? {}) || [],
    [chat?.position]
  );

  const handlePageItemClick = useCallback((key, selectedChat) => {
    let bboxes = [];

    const selectedPageNumber = `${selectedChat.id}__${key}`;
    changeSelectedPageNumber(selectedPageNumber);

    if (Array.isArray(selectedChat.position[key])) {
      bboxes = selectedChat.position[key].map((item) => {
        return { box: item, fieldId: crypto.randomUUID() };
      });
      handleChatBboxesScroll(bboxes);
    }

    documentActions.updateChatAIBboxes({ bboxes });
  }, []);

  useEffect(() => {
    if (positions.length > PAGINATION_LIMITER) {
      setVisiblePositions(positions.slice(0, PAGINATION_LIMITER));
    } else {
      setVisiblePositions(positions);
    }
  }, [positions]);

  useEffect(() => {
    const lastChat = chats?.length ? chats[chats?.length - 1] : {};
    const lastChatPositionArray = chats?.length
      ? Object.keys(lastChat?.position ?? {})
      : [];

    if (postQuestion.status === 'success' && lastChatPositionArray.length) {
      handlePageItemClick(lastChatPositionArray[0], lastChat);
    }
  }, [postQuestion.status, chats, handlePageItemClick]);

  const toggleShowMore = () => {
    setShowMore((prevShowMore) => {
      if (prevShowMore) {
        setVisiblePositions(positions.slice(0, PAGINATION_LIMITER));
      } else {
        setVisiblePositions(positions);
      }
      return !prevShowMore;
    });
  };

  const handleMessageCopy = (text) => {
    copy(text);
    showToast({
      title: 'Answer copied to clipboard',
      success: true,
    });
    trackMixpanelEvents(MIXPANEL_EVENTS.copy_response_chat_ai);
  };

  const handleChatBboxesScroll = (bboxes) => {
    const [x1, y1] = bboxes[0].box;

    const domEl = document.getElementById('rt-document');
    const documentWrapperNode = document.getElementById('rt-document-wrapper');

    const { width, height } = domEl.getBoundingClientRect();

    const {
      // status: docStatus,
      width: docWidth,
      height: docHeight,
    } = docMeta;

    const XD1 = (x1 / docWidth) * 100;
    const YD1 = (y1 / docHeight) * 100;

    let styleTopAbs = (YD1 / 100) * height;
    let styleLeftAbs = (XD1 / 100) * width;

    let scrollX = styleLeftAbs;
    let scrollY = styleTopAbs;

    if (scrollX > 100) {
      scrollX -= 100;
    }

    if (scrollY > 80) {
      scrollY -= 80;
    }

    if (documentWrapperNode) {
      documentWrapperNode.scrollTo(scrollX, scrollY);
    }
  };

  const handleRetryButtonClick = () => {
    chatAIActions.retryChatAIQuestion({ docId: docId, chatId: chat.id });
  };

  const trackMixpanelEvents = (evt) => {
    mixpanel.track(evt, {
      'work email': email,
      'organization ID': orgId,
      mode,
      version: 'new',
      role,
      canSwitchUIVersion: canSwitchToOldMode,
      docType: type,
    });
  };

  return (
    <div className={styles.messageContainer}>
      {chat?.question ? (
        <div className='p-4'>
          <div className={cx(styles.message)}>
            <div className={cx(styles.message__iconWrap)}>
              <span
                className={cx(
                  styles.message__icon,
                  styles['message__icon--avatar']
                )}
              >
                <User />
              </span>
            </div>
            <div className={cx(styles.message__text)}>{chat.question}</div>
            <div className={styles.message__iconWrap} />
          </div>
        </div>
      ) : null}
      {chat?.error ? (
        <FeedbackBox
          showError
          handleRetryButtonClick={handleRetryButtonClick}
          isLoading={
            chat.id === retryQuestion.payload?.chatId &&
            retryQuestion.status === 'loading'
          }
        />
      ) : null}
      {!chat?.error && chat?.answer ? (
        <div className='bg-gray-100 p-4'>
          <div className={cx(styles.message)}>
            <div className={styles.message__iconWrap}>
              <span
                className={cx(
                  styles.message__icon,
                  styles['message__icon--logo']
                )}
              >
                <DocsumoIcon />
              </span>
            </div>
            <div className={cx(styles.message__text)}>{chat.answer}</div>
            <div
              className={cx(styles.message__iconWrap, 'justify-content-end')}
            >
              <Tooltip label='Copy'>
                <IconButton
                  icon={<Copy />}
                  variant={VARIANT.GHOST}
                  size='small'
                  onClick={() => handleMessageCopy(chat.answer)}
                />
              </Tooltip>
            </div>
          </div>
          {positions.length ? (
            <div className={styles.pagination}>
              <Page className={styles.pagination__icon} />
              <div className={styles.pagination__list}>
                {visiblePositions.map((item) => (
                  <Button
                    key={item}
                    className={cx(styles.pagination__button, {
                      [styles['pagination__button--selected']]:
                        selectedPageNumber === `${chat.id}__${item}`,
                    })}
                    variant={VARIANT.GHOST}
                    size='small'
                    onClick={() => {
                      handlePageItemClick(item, chat);
                      trackMixpanelEvents(
                        MIXPANEL_EVENTS.page_reference_chat_ai
                      );
                    }}
                  >
                    {item}
                  </Button>
                ))}
                {positions.length > PAGINATION_LIMITER ? (
                  <Button
                    variant={VARIANT.GHOST}
                    size='small'
                    onClick={toggleShowMore}
                    className={cx(styles.pagination__button)}
                  >
                    {showMore ? 'Show Less' : 'Show More'}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state) => {
  const { chats, postQuestion, retryQuestion } = state.chatAI;

  const { app } = state;

  const { documentsById, docId } = state.documents.reviewTool;

  const docMeta = documentsById[docId] || null;

  return {
    chats,
    postQuestion,
    retryQuestion,
    docId,
    docMeta,
    email: app?.user?.email,
    orgId: app?.user?.orgId,
    mode: app?.user?.mode,
    role: app?.user.role,
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

export default connect(mapStateToProps, mapDispatchToProps)(MessageBubble);
