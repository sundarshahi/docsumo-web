import React, { useState } from 'react';
import { connect } from 'react-redux';
import { chatAIActions } from 'new/redux/chatai/actions';
import { bindActionCreators } from 'redux';

import cx from 'classnames';
import { SendDiagonal } from 'iconoir-react';
import mixpanel from 'mixpanel-browser';
import { SUPPORT_LINK } from 'new/constants/urllink';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import IconButton, { VARIANT } from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './ChatBox.scss';

const ChatBox = ({
  docId,
  chatAI,
  chatAIActions,
  email,
  orgId,
  mode,
  canSwitchToOldMode,
  type,
  role,
}) => {
  const [chatInputText, setChatInputText] = useState('');
  const handleChatInputChange = (e) => {
    const inputValue = e.target.value.trim();

    if (inputValue !== '') {
      setChatInputText(e.target.value);
    } else {
      if (chatInputText !== '') {
        setChatInputText('');
      }
    }
  };

  const handleChatMessageSubmit = () => {
    chatAIActions.postChatAIQuestion({
      data: { question: chatInputText },
      docId: docId,
    });
    setChatInputText('');
    trackAskQuestion();
  };

  const handleKeyPress = (e) => {
    const { key } = e;
    if (
      key === 'Enter' &&
      chatInputText.length &&
      chatAI.postQuestion.status !== 'loading'
    ) {
      handleChatMessageSubmit();
    }
  };

  const trackAskQuestion = () => {
    mixpanel.track(MIXPANEL_EVENTS.ask_question_chat_ai, {
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
    <div className={'m-4'}>
      <div
        className={cx('d-flex justify-content-end clr-gray-800 text-xxs', {
          ['clr-error']: chatInputText.length === 100,
        })}
      >{`${100 - chatInputText.length}/100 characters left`}</div>
      <div
        className={styles.chatInput}
        tabIndex={0}
        role='button'
        onKeyDown={handleKeyPress}
      >
        <Input
          type='text'
          onChange={handleChatInputChange}
          value={chatInputText}
          inputGroupClassName={styles.chatInput__textField}
          maxLength={100}
          placeholder={'Ask anything about this file...'}
          iconPosition='right'
          className={styles.chatInput__input}
        />
        <Tooltip
          className={styles.chatInput__tooltip}
          label='Send Message'
          showTooltip={chatInputText.length ? true : false}
        >
          <IconButton
            icon={<SendDiagonal />}
            onClick={handleChatMessageSubmit}
            variant={
              chatInputText.length ? VARIANT.CONTAINED : VARIANT.OUTLINED
            }
            disabled={
              !chatInputText.length || chatAI.postQuestion.status === 'loading'
            }
          />
        </Tooltip>
      </div>
      <div className='text-xxs font-medium clr-gray-900 text-center'>
        Not getting your desired output? Check out our resources&nbsp;
        <a
          href={SUPPORT_LINK.CHAT_AI_DOC}
          target='_blank'
          rel='noopener noreferrer'
          className={styles.link}
        >
          here
        </a>
      </div>
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
    email: app?.user?.email,
    orgId: app?.user?.orgId,
    mode: app?.user?.mode,
    type: docMeta?.type,
    role: app?.user?.role,
    canSwitchToOldMode: app?.config?.canSwitchToOldMode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return { chatAIActions: bindActionCreators(chatAIActions, dispatch) };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatBox);
