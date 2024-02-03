import React, { Fragment } from 'react';

import cx from 'classnames';
import {
  Cancel,
  ChatBubbleQuestion,
  Circle,
  IconoirProvider,
  QuestionMark,
} from 'iconoir-react';

import styles from './Badge.scss';

function Badges({
  title = '',
  type = '',
  size = '',
  iconDirection = 'left',
  iconType,
  CustomIcons,
  onClick,
  badgeIconHandler = null,
  className,
  iconClassName,
}) {
  const IconProps = {
    width: '15px',
    height: '15px',
  };

  const BADGE_TYPES = {
    PRIMARY: 'primary',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
  };

  const ICON_TYPES = {
    CLOSE: 'close',
    WARNING: 'warning',
    CIRCLE: 'circle',
    BUBBLE_WARNING: 'bubbleWarning',
  };

  const ICON_DIRECTION = {
    RIGHT: 'right',
    LEFT: 'left',
  };

  const SIZE = {
    LG: 'lg',
  };

  const BadgeIcons = ({ marginClass }) => {
    return (
      <span
        className={cx(marginClass, styles.badgeActions, iconClassName, {
          ['cursor-pointer']: !!badgeIconHandler,
        })}
        onClick={badgeIconHandler}
        role='presentation'
      >
        {iconType === ICON_TYPES.CLOSE && <Cancel />}
        {iconType === ICON_TYPES.WARNING && <QuestionMark />}
        {iconType === ICON_TYPES.BUBBLE_WARNING && <ChatBubbleQuestion />}
        {iconType === ICON_TYPES.CIRCLE && <Circle />}
        {CustomIcons}
      </span>
    );
  };

  return (
    <IconoirProvider iconProps={IconProps}>
      <Fragment key='badges'>
        {title ? (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <span
            className={cx(
              'px-2 py-1 text-xs',
              styles.badgeDefault,
              { [styles.badgeSuccess]: type === BADGE_TYPES.SUCCESS },
              { [styles.badgeError]: type === BADGE_TYPES.ERROR },
              { [styles.badgeWarning]: type === BADGE_TYPES.WARNING },
              { [styles.badgePrimary]: type === BADGE_TYPES.PRIMARY },
              { 'text-sm': size === SIZE.LG },
              className
            )}
            onClick={onClick}
          >
            {iconDirection === ICON_DIRECTION.LEFT &&
              (CustomIcons || iconType) && <BadgeIcons marginClass='mr-2' />}
            {title}
            {iconDirection === ICON_DIRECTION.RIGHT &&
              (CustomIcons || iconType) && <BadgeIcons marginClass='ml-2' />}
          </span>
        ) : null}
      </Fragment>
    </IconoirProvider>
  );
}

export default Badges;
