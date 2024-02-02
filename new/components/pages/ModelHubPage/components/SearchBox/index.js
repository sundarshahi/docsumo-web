import React, { useState } from 'react';

import { Cancel } from 'iconoir-react';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Input from 'new/ui-elements/Input/Input';

import styles from './SearchBox.scss';

function SearchBox({ name, value, onChange, onClear }) {
  const [showAnimation, setAnimation] = useState(true);

  const handleInputFocus = () => {
    setAnimation(false);
  };

  const handleInputblur = () => {
    if (!value) {
      setAnimation(true);
    }
  };

  const handleClearInput = () => {
    onClear();
    setAnimation(true);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Input
          name={name}
          value={value}
          onChange={onChange}
          className={styles.input}
          onFocus={handleInputFocus}
          onBlur={handleInputblur}
        />
        {showAnimation && !value ? (
          <div className={styles.input__placeholder}>
            <span className={styles['input__placeholder-item']}>
              <span>Search "Invoice"</span>
            </span>
            <span className={styles['input__placeholder-item']}>
              <span>Search "Bank Statement"</span>
            </span>
            <span className={styles['input__placeholder-item']}>
              <span>Search "W9 Forms"</span>
            </span>
            <span className={styles['input__placeholder-item']}>
              <span>Search "Rent Rolls"</span>
            </span>
            <span className={styles['input__placeholder-item']}>
              <span>Search "Acord"</span>
            </span>
          </div>
        ) : null}
        {value.length ? (
          <IconButton
            icon={<Cancel />}
            variant='text'
            onClick={handleClearInput}
            className={styles.clearBtn}
            title='Clear search'
          />
        ) : null}
      </form>
    </div>
  );
}

export default SearchBox;
