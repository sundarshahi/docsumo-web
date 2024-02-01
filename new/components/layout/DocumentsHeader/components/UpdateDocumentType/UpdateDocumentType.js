import React, { useState } from 'react';

import RadioButton from 'new/ui-elements/RadioButton/RadioButton';

import styles from './UpdateDocumentType.scss';

const UpdateDocumentType = (props) => {
  const { options = [], onDocTypeSelection = null } = props;
  const [selectedDocId, setSelectedDocId] = useState('');
  const handleRadioButtonChange = (id) => {
    setSelectedDocId(id);
    onDocTypeSelection(id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Change Doc Type To:</div>
      <div className={styles.list}>
        {options.map(({ title, id }) => (
          <div className={styles.col} key={id}>
            <label className={styles.radioGroup}>
              <RadioButton
                name='role'
                checked={id === selectedDocId}
                onChange={() => handleRadioButtonChange(id)}
              />
              <span className={styles.value} title={title}>
                {title}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdateDocumentType;
