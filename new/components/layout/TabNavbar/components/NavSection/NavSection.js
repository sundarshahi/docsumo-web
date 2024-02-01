/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import cx from 'classnames';
import { NavArrowRight } from 'iconoir-react';

import styles from './NavSection.scss';

function NavSection(props) {
  const {
    selectedFolderData,
    onRootNavClick,
    activeTab,
    className = '',
  } = props;
  return (
    <div className={cx(styles.container, className)}>
      <div
        className={styles.nav_item}
        onClick={() => onRootNavClick(activeTab)}
      >
        My Documents
      </div>
      {selectedFolderData?.folderName && (
        <>
          <div className={cx(styles.nav_item)}>
            <span className={styles.nav_icon}>
              <NavArrowRight />
            </span>
            <span
              title={selectedFolderData.folderName}
              className={cx(styles.nav__text, 'text-truncate')}
            >
              {selectedFolderData.folderName}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default NavSection;
