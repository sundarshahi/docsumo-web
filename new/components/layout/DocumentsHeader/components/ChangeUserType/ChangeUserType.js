import React, { useState } from 'react';

import cx from 'classnames';
import InfiniteScroll from 'new/ui-elements/InfiniteScroll';
import RadioButton from 'new/ui-elements/RadioButton/RadioButton';

import styles from './ChangeUserType.scss';

const ChangeUserType = (props) => {
  const { options, onUserSelection, isLoading, onFetchUser } = props;
  const [selectedUserId, setSelectedUserId] = useState('');
  const handleRadioButtonChange = (userId) => {
    setSelectedUserId(userId);
    onUserSelection(userId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Assign Doc To:</div>
      <div className={styles.list}>
        <InfiniteScroll fetchData={onFetchUser} isLoading={isLoading}>
          {options.map(({ fullName, userId }) => (
            <div className={styles.col} key={userId}>
              <label className={styles.radioGroup}>
                <RadioButton
                  name='role'
                  checked={userId === selectedUserId}
                  onChange={() => handleRadioButtonChange(userId)}
                />
                <span className={cx(styles.value, 'ellipsis')} title={fullName}>
                  {fullName}
                </span>
              </label>
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default ChangeUserType;
