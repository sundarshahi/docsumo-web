import React from 'react';

import cx from 'classnames';
import { NavArrowLeft, NavArrowRight } from 'iconoir-react';

import styles from './PaginationButton.scss';
const ellipsis = '•••';
export const PaginationButton = ({
  title = '',
  text,
  disabled,
  onClick,
  id,
  type,
  selected,
}) => {
  const rootClassNames = cx(
    styles.root,
    styles[`type-${type}`],
    selected ? styles.selected : null,
    disabled ? styles.disabled : null
  );

  const buttonInnerText = () => {
    switch (type) {
      case 'back':
        return <NavArrowLeft />;
      case 'next':
        return <NavArrowRight />;
      case 'dots':
        return <span>{ellipsis}</span>;
      case 'text':
        return <span>{text}</span>;
      default:
        return <span></span>;
    }
  };
  return (
    <button
      id={id}
      className={rootClassNames}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {buttonInnerText()}
    </button>
  );
};
