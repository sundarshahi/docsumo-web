/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

import cx from 'classnames';
import { NavArrowDown } from 'iconoir-react';

import styles from './KeyValueAccordion.scss';

function KeyValueBlock(props) {
  const {
    className,
    children,
    label,
    value,
    data = [],
    isChild = false,
    isTotalType = false,
    level = 1,
  } = props;

  const [showDetails, setShowDetails] = useState(false);

  const toggleShowDetails = () => setShowDetails(!showDetails);

  return (
    <div className={cx(styles.container, className)}>
      <div
        className={cx(styles.topContainer, {
          [styles.topContainer_child]: isChild,
          [styles.topContainer_total]: isTotalType,
          [styles.topContainer_open]: showDetails,
          [styles.topContainer_noclick]: !data.length,
        })}
        onClick={toggleShowDetails}
      >
        <div className={styles.topContainerContent}>
          {isTotalType ? null : data.length ? (
            <span
              className={cx(styles.icon, {
                [styles.icon_open]: showDetails,
              })}
            >
              <NavArrowDown height={16} width={16} />
            </span>
          ) : null}
          <div className={cx(styles.content)}>
            <span className={styles.key} title={label}>
              {label || '-'}
            </span>
            <span className={styles.value}>{value || '-'}</span>
          </div>
        </div>
      </div>
      {showDetails && <div className={styles.bottomContainer}>{children}</div>}
    </div>
  );
}

export default KeyValueBlock;
