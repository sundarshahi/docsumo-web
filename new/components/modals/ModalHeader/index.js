import React from 'react';

import cx from 'classnames';
import { Cancel, InfoEmpty } from 'iconoir-react';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './modalHeader.scss';

const ModalHeader = ({
  title,
  showInfoIcon = false,
  handleCloseBtnClick,
  href,
  label,
  oldModal = false,
}) => {
  return (
    <>
      <div
        className={oldModal ? cx(styles.headerAlt) : cx('p-4', styles.header)}
      >
        <p className='heading-6 font-weights-bold'>{title}</p>
        <div className={styles.header__close}>
          <Tooltip placement='bottom' label={label}>
            {showInfoIcon ? (
              <a
                className={cx('cursor-pointer')}
                target='_blank'
                rel='noopener noreferrer'
                href={href}
              >
                <InfoEmpty
                  className={styles.icon}
                  height='1.5rem'
                  width='1.5rem'
                />
              </a>
            ) : null}
          </Tooltip>
          <IconButton
            icon={<Cancel height={24} width={24} />}
            className='ml-4'
            variant='ghost'
            onClick={handleCloseBtnClick}
          />
        </div>
      </div>
    </>
  );
};

export default ModalHeader;
