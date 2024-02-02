import React from 'react';

import cx from 'classnames';
import { ReactComponent as LoaderIcon } from 'new/assets/images/icons/loader.svg';
import PropTypes from 'prop-types';

import styles from './button.scss';

const SIZES = {
  // SMALL: 'small',
  DEFAULT: 'default',
  LARGE: 'large',
};

const APPEARANCES = {
  PRIMARY: 'primary',
  PRIMARY_TRANSPARENT: 'primary-transparent',
  PRIMARY_REVERSED: 'primary-reversed',
  WHITE_SHADOWED: 'white-shadowed',
  CUSTOM_ZERO_CASE_UPLOAD: 'custom-zero-case-upload',
  OUTLINED: 'outlined',
  PRIMARY_COMPANY: 'primary-company',
  PRIMARY_COMPANY_TRANSPARENT: 'primary-company-transparent',
};

const Button = (props) => {
  const {
    onClick,
    size = SIZES.DEFAULT,
    appearance = APPEARANCES.PRIMARY,
    disabled = false,
    isLoading = false,
    iconLeft: IconLeft,
    iconRight: IconRight,
    iconCenter: IconCenter,
    isCenter = false,
    id,
    className,
    iconClassName,
    iconLeftClassName,
    iconRightClassName,
    children,
    text,
    loadingText,
    title,
    loaderClassName,
    buttonAttributes = {},
    ...rest
  } = props;

  let iconLeftNode = null;
  if (isLoading && !isCenter) {
    iconLeftNode = (
      <span
        className={cx(
          styles.iconWrapper,
          styles.left,
          styles.loader,
          loaderClassName
        )}
      >
        <LoaderIcon />
      </span>
    );
  } else if (IconLeft) {
    iconLeftNode = (
      <span
        className={cx(
          styles.iconWrapper,
          styles.left,
          iconClassName,
          iconLeftClassName
        )}
      >
        <IconLeft />
      </span>
    );
  }

  let iconNode = null;
  if (isLoading && isCenter) {
    iconNode = (
      <span className={cx(styles.iconWrapper, styles.loader, loaderClassName)}>
        <LoaderIcon />
      </span>
    );
  } else if (IconCenter) {
    iconLeftNode = (
      <span className={cx(styles.iconWrapper, iconClassName)}>
        <IconCenter />
      </span>
    );
  }

  let iconRightNode = null;
  if (!isLoading && IconRight) {
    iconRightNode = (
      <span
        className={cx(
          styles.iconWrapper,
          styles.right,
          iconClassName,
          iconRightClassName
        )}
      >
        <IconRight />
      </span>
    );
  }

  let contentNode = null;
  if (isLoading && loadingText) {
    contentNode = loadingText;
  } else {
    contentNode = children || text || null;
  }

  // TODO Remove this log statement
  // eslint-disable-next-line no-console
  // console.log(props, disabled);

  const rootClassNames = cx(
    styles.root,
    styles[`size-${size}`] || '',
    styles[`appearance-${appearance}`] || '',
    className
  );

  return (
    <button
      id={id}
      className={rootClassNames}
      onClick={onClick}
      disabled={disabled || isLoading}
      title={title || ''}
      {...buttonAttributes}
      {...rest}
    >
      {iconLeftNode}
      {iconNode}
      {contentNode}

      {iconRightNode}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func,
  size: PropTypes.oneOf(Object.values(SIZES)),
  appearance: PropTypes.oneOf(Object.values(APPEARANCES)),
  // appearance: PropTypes.oneOf(['default', 'minimal', 'primary']).isRequired,
  /**
   * When true, the button is disabled.
   * isLoading also sets the button to disabled.
   */
  disabled: PropTypes.bool,

  /**
   * When true, show a loading spinner before the children.
   * This also disables the button.
   */
  isLoading: PropTypes.bool,

  /**
   * Sets an icon component before the text.
   */
  iconLeft: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.element,
    PropTypes.func,
  ]),

  /**
   * Sets an icon component after the text.
   */
  iconRight: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.element,
    PropTypes.func,
  ]),

  /**
   * Id name passed to the button.
   */
  id: PropTypes.string,

  /**
   * Class name passed to the button.
   */
  className: PropTypes.string,

  /**
   * Class name passed to the icons.
   */
  iconClassName: PropTypes.string,

  /**
   * Class name passed to the left icon.
   */
  leftIconClassName: PropTypes.string,

  /**
   * Class name passed to the right icon.
   */
  rightIconClassName: PropTypes.string,

  /**
   * Node to render in the button.
   */
  children: PropTypes.node,

  /**
   * Text to display in the button.
   */
  text: PropTypes.string,

  /**
   * Text to display in the button while loading.
   */
  loadingText: PropTypes.string,
};

export default Button;
export { APPEARANCES, SIZES };
