import React from 'react';

import cx from 'classnames';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import PropTypes from 'prop-types';

import styles from './IconButton.scss';

export const SIZE = {
  EXTRA_SMALL: 'extra-small',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

export const VARIANT = {
  CONTAINED: 'contained',
  OUTLINED: 'outlined',
  TEXT: 'text',
  GHOST: 'ghost',
};

export const COLOR_SCHEME = {
  primary: 'primary',
  danger: 'danger',
  success: 'success',
};

const IconButton = (props) => {
  const {
    onClick,
    size = SIZE.SMALL,
    variant = VARIANT.CONTAINED,
    disabled = false,
    isLoading = false,
    icon,
    id,
    className,
    iconClassName,
    title,
    type = 'button',
    colorScheme = COLOR_SCHEME.primary,
  } = props;
  let Icon = icon;
  let iconNode = null;

  if (isLoading) {
    iconNode = (
      <span className={cx(styles.btn__icon, styles.btn__loader)} title={title}>
        <LoaderIcon />
      </span>
    );
  } else if (icon) {
    iconNode = (
      <span className={cx(styles.btn__icon, iconClassName)} title={title}>
        {React.isValidElement(icon) ? icon : <Icon />}
      </span>
    );
  }

  const rootClassNames = cx(
    styles.btn,
    styles[`btn-${size}`] || '',
    styles[`btn-${variant}`] || '',
    styles[`btn--color-${colorScheme}`] || '',
    className
  );

  return (
    <button
      id={id}
      className={rootClassNames}
      onClick={onClick}
      disabled={disabled || isLoading}
      type={type}
    >
      {iconNode}
    </button>
  );
};

IconButton.propTypes = {
  onClick: PropTypes.func,
  size: PropTypes.oneOf(Object.values(SIZE)),
  variant: PropTypes.oneOf(Object.values(VARIANT)),
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]).isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  colorScheme: PropTypes.oneOf(Object.values(COLOR_SCHEME)),
};

export default IconButton;
