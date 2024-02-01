import React from 'react';

import Input from 'new/ui-elements/Input/Input';

import styles from './SearchBox.scss';

function SearchBox(props) {
  const { name, value, placeholder, onChange, onClear } = props;

  return (
    <div className={styles.container}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Input
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.input}
        />
      </form>
    </div>
  );
}

export default SearchBox;
