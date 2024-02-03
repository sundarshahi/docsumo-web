/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

import cx from 'classnames';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';

import styles from './Tabs.scss';

const Tabs = ({
  tabHeaders = [],
  activeTab,
  onTabChange,
  className = '',
  editFieldAccess,
}) => {
  const changeActiveTab = (tab) => {
    onTabChange(tab);
  };

  return (
    <div className={cx(styles.tabs, className)} role='tablist'>
      {tabHeaders.map(
        ({
          count,
          header,
          url,
          icon,
          className = '',
          badge,
          actionIcon,
          actionIconHandler,
          actionTitle,
          actionIconClassname,
        }) => {
          return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
              key={url}
              className={cx(styles.tab, className, {
                [styles['tab--active']]: url === activeTab,
              })}
              role='tab'
              onClick={() => changeActiveTab(url)}
              tabIndex={url === activeTab ? 0 : -1}
            >
              <span className={styles.tab__icon}>{icon}</span>
              <p className={styles.tab__text}>{header}</p>
              {actionIcon && (
                <Tooltip
                  placement={'bottom'}
                  label={actionTitle}
                  className='ml-2 mt-0.5'
                  showTooltip={editFieldAccess}
                >
                  <IconButton
                    variant='text'
                    disabled={!editFieldAccess}
                    onClick={actionIconHandler}
                    icon={actionIcon}
                    className={cx(
                      styles['tab__icon--right'],
                      {
                        [styles['tab__icon--disabled']]: !editFieldAccess,
                      },
                      actionIconClassname
                    )}
                  />
                </Tooltip>
              )}
              {count ? (
                <span className={styles.tab__count}>({count})</span>
              ) : (
                ''
              )}
              <span className={styles.tab__badge}> {badge ? badge : ''}</span>
            </div>
          );
        }
      )}
    </div>
  );
};

export default Tabs;
