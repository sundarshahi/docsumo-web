import React, { useState } from 'react';

import cx from 'classnames';
import clipboardCopy from 'clipboard-copy';
import { Link } from 'iconoir-react';
import iconGmail from 'new/assets/images/icons/icon-gmail.png';
import iconZapier from 'new/assets/images/icons/icon-zapier.png';
import { SUPPORT_LINK } from 'new/constants/urllink';
import Button from 'new/ui-elements/Button/Button';
import Input from 'new/ui-elements/Input/Input';

import styles from './UploadMethods.scss';

const UploadMethods = ({ selectedDocumentType, setToast }) => {
  const [showEmailLink, setShowEmailLink] = useState(false);

  const handleEmailClick = () => {
    setShowEmailLink(!showEmailLink);
  };

  const handleCopyText = () => {
    clipboardCopy(selectedDocumentType?.uploadEmail);
    setToast({
      title: 'Email copied to clipboard',
      success: true,
    });
  };

  return (
    <div className={styles.uploadMethods}>
      <p className={styles.uploadMethods__title}>
        <span className={styles['uploadMethods__title-text']}>
          or auto import documents via
        </span>
      </p>
      <div className={styles.uploadMethods__list}>
        <button
          className={cx(styles.uploadMethods__item, {
            [styles['uploadMethods__item--active']]: showEmailLink,
          })}
          onClick={handleEmailClick}
        >
          <img src={iconGmail} alt='gmail' className='mr-2' />
          Email
        </button>
        <a
          href={selectedDocumentType?.apiDoc || SUPPORT_LINK.API_DOC_LINK}
          target='_blank'
          no
          className={styles.uploadMethods__item}
          rel='noopener noreferrer'
        >
          <Link className='mr-2' />
          API
        </a>
        <a
          href={selectedDocumentType?.zapierDoc || SUPPORT_LINK.ZAPIER_DOC}
          target='_blank'
          className={styles.uploadMethods__item}
          rel='noopener noreferrer'
        >
          <img src={iconZapier} alt='zapier' className='mr-2' />
          Zapier
        </a>
      </div>

      {showEmailLink && (
        <div className={styles.email}>
          <p className='mr-5'>Email</p>
          <div className={styles.email__link}>
            <Input
              value={selectedDocumentType?.uploadEmail}
              className={styles['email__link-input']}
            />
            <p className={styles['email__link-helper']}>
              *File size should be maximum 25mb, and it shouldn't be password
              protected.{' '}
              <a
                href={selectedDocumentType?.emailDoc || SUPPORT_LINK.EMAIL_DOC}
                target='_blank'
                className={styles['email__link-doc']}
                rel='noopener noreferrer'
              >
                Learn more
              </a>
            </p>
          </div>
          <Button variant='outlined' size='small' onClick={handleCopyText}>
            Copy
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadMethods;
