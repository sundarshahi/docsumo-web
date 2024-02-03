import React from 'react';

import cx from 'classnames';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import PropTypes from 'prop-types';

import styles from './Button.scss';
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
  OUTLINED_INVERTED: 'outlined-inverted',
  GHOST: 'ghost',
};

export const COLOR_SCHEME = {
  primary: 'primary',
  danger: 'danger',
};

const Button = (props) => {
  const {
    onClick,
    size = SIZE.MEDIUM,
    variant = VARIANT.CONTAINED,
    disabled = false,
    isLoading = false,
    icon,
    iconPosition = 'left',
    id,
    className,
    children,
    title,
    loaderClassName,
    iconClassName,
    type = 'button',
    fluid = false,
    active = false,
    colorScheme = COLOR_SCHEME.primary,
    ...restProps
  } = props;
  let Icon = icon;
  const rootClassNames = cx(
    styles.btn,
    styles[`btn--${size}`] || '',
    styles[`btn--${variant}`] || '',
    styles[`btn--color-${colorScheme}`] || '',
    { [styles['btn--active']]: active },
    { [styles['btn--fluid']]: fluid },
    className
  );

  let iconContent = null;
  let contentNode = (
    <span
      className={cx(styles.btn__content, {
        [styles.btn__contentHidden]: isLoading && !icon,
      })}
    >
      {children}{' '}
    </span>
  );

  let loaderContent = isLoading ? (
    <span
      className={cx(
        styles.btn__icon,
        styles.btn__loader,
        { [styles.btn__loaderCenter]: isLoading && !icon },
        loaderClassName
      )}
    >
      <LoaderIcon />
    </span>
  ) : null;

  if (isLoading && icon) {
    iconContent = loaderContent;
  } else if (icon) {
    iconContent = (
      <span
        className={cx(
          styles.btn__icon,
          styles[`btn__icon--${iconPosition}`],
          iconClassName
        )}
      >
        {React.isValidElement(icon) ? icon : <Icon />}
      </span>
    );
  }

  return (
    <button
      id={id}
      className={rootClassNames}
      onClick={onClick}
      disabled={disabled}
      title={title || ''}
      type={type}
      {...restProps}
    >
      {iconPosition === 'left' ? iconContent : ''}

      {contentNode}
      <span className={styles.btn__centerLoader}>
        {isLoading && !icon ? loaderContent : null}
      </span>
      {iconPosition === 'right' ? iconContent : ''}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  size: PropTypes.oneOf(Object.values(SIZE)),
  variant: PropTypes.oneOf(Object.values(VARIANT)),
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  id: PropTypes.string,
  className: PropTypes.string,
  loaderClassName: PropTypes.string,
  children: PropTypes.node,
  title: PropTypes.string,
  type: PropTypes.string,
  colorScheme: PropTypes.oneOf(Object.values(COLOR_SCHEME)),
};

export default Button;
