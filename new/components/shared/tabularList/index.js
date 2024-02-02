import React from 'react';

import cx from 'classnames';
import { ReactComponent as ArrowDownwardIcon } from 'new/assets/images/icons/arrow-downward.svg';
import { ReactComponent as ArrowUpwardIcon } from 'new/assets/images/icons/arrow-upward.svg';

import styles from './index.scss';

const Header = (props) => {
  const { className, children } = props;

  return <div className={cx(styles.header, className)}>{children}</div>;
};

const HeaderCell = (props) => {
  const {
    className,
    style = {},
    sortKey,
    sortOrder,
    onClick,
    children,
  } = props;

  const isSortable = !!sortKey;
  let SortIconComponent;
  if (isSortable) {
    if (sortOrder === 'asc') {
      SortIconComponent = ArrowUpwardIcon;
    } else if (sortOrder === 'desc') {
      SortIconComponent = ArrowDownwardIcon;
    }
  }

  return (
    <div className={cx(styles.headerCell, className)} style={style}>
      {isSortable ? (
        <button
          className={cx('unstyled-btn', styles.btn)}
          onClick={() => onClick(sortKey)}
          title={'Sort By Date'}
        >
          {children}
          {SortIconComponent ? (
            <SortIconComponent className={styles.sortIcon} />
          ) : null}
        </button>
      ) : (
        children
      )}
    </div>
  );
};

const Row = (props) => {
  const { className, children, ...rest } = props;

  return (
    <div className={cx(styles.row, className)} {...rest}>
      {children}
    </div>
  );
};
const Card = (props) => {
  const { className, children, onHandleClick, id } = props;

  return (
    <div
      id={id}
      className={cx(className)}
      role='presentation'
      onClick={onHandleClick ? onHandleClick : null}
    >
      {children}
    </div>
  );
};

const Cell = (props) => {
  const { className, style = {}, children, title } = props;

  return (
    <div className={cx(styles.cell, className)} style={style} title={title}>
      {children}
    </div>
  );
};

export { Card, Cell, Header, HeaderCell, Row };
