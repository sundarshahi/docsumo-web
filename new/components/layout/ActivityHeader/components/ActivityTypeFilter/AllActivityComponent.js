import React from 'react';

import cx from 'classnames';
import Checkbox from 'new/ui-elements/Checkbox/Checkbox';

import styles from './activityType.scss';

export const AllActivityComponent = (props) => {
  const {
    activityOptions = [],
    activityFilter = [],
    handleChangeFilterSubType,
  } = props;

  const toggle = (value) => !value;
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
                  const checked = activityFilter.includes(itm.value);
                  return (
                    <div className={styles.col} key={itm.value}>
                      <label className={styles.checkboxGroup}>
                        <Checkbox
                          name={itm.title}
                          checked={checked}
                          onChange={() =>
                            handleChangeFilterSubType({
                              name: itm.name,
                              value: itm.value,
                              checked: toggle(checked),
                            })
                          }
                          value={itm.value}
                        />
                        <span className={styles.value} title={itm.title}>
                          {itm.title}
                        </span>
                      </label>
                    </div>
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
