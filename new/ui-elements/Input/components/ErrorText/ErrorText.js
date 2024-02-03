import React from 'react';

import { InfoEmpty } from 'iconoir-react';

import styles from './ErrorText.scss';

const ErrorText = ({ children }) => {
  return (
    <>
      {children ? (
        <div className={styles.errorText}>
          <span className='mr-1'>
            <InfoEmpty width={'0.8125rem'} height={'0.8125rem'} />
          </span>
          {children}
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default ErrorText;
