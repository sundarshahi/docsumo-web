import React from 'react';

import cx from 'classnames';
import chatBoxDoc from 'new/assets/images/chat-box-doc.png';

import styles from './ChatEmptyState.scss';

const ChatEmptyState = () => {
  return (
    <div className='d-flex justify-content-center align-items-center flex-direction-column text-center h-100'>
      <img src={chatBoxDoc} alt='chat box' />
      <p className='heading-6 mb-1'>Welcome to Chat AI</p>
      <p className={cx('clr-gray-800', styles.subTitle)}>
        A chat assistant that swiftly extracts, locates, and summarizes
        information from your documents.
      </p>
    </div>
  );
};

export default ChatEmptyState;
