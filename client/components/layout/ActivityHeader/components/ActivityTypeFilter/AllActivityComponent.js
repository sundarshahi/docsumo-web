import React from 'react';

import cx from 'classnames';
import { Checkbox } from 'client/components/widgets/checkbox';

import styles from './activityType.scss';

export const AllActivityComponent = (props) => {
  const {
    activityOptions = [],
    activityFilter = [],
    handleChangeFilterSubType,
  } = props;
  return (
    <div className={cx(styles.root)}>
      {activityOptions.map((item) => {
        return (
          <div className={styles.Col} key={item.activityTitle}>
            <div className={styles.content}>
              <div className={cx(styles.header)}>
                <span className={styles.icon}>{item.icon}</span>
                <span className={cx(styles.activityTitle)}>{item.title}</span>
              </div>
              <div className={cx(styles.filterContent)}>
                {item.subType.map((itm) => {
                  return (
                    <Checkbox
                      key={item.value}
                      name={itm.title}
                      id={itm.value}
                      label={itm.title}
                      checked={activityFilter.includes(itm.value)}
                      value={itm.value}
                      className={styles.rootCheck}
                      labelClassName={styles.checkLabel}
                      onChange={handleChangeFilterSubType}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
