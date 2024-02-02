import React from 'react';

import cx from 'classnames';
import Tooltip from 'rc-tooltip';

import styles from './errorTooltip.scss';

const ErrorTooltip = (props) => {
  const finalProps = {
    placement: 'bottom',
    mouseLeaveDelay: 0.1,
    ...props,
    overlayClassName: cx(styles.overlay, props.overlayClassName),
  };
  return <Tooltip {...finalProps}>{props.children}</Tooltip>;
};

const GeneralTooltip = (props) => {
  const finalProps = {
    placement: 'bottom',
    mouseLeaveDelay: 0.1,
    ...props,
    overlayClassName: cx(styles.generalOverlay, props.overlayClassName),
  };
  return <Tooltip {...finalProps}>{props.children}</Tooltip>;
};
const HeaderTooltip = (props) => {
  const finalProps = {
    placement: 'bottom',
    mouseLeaveDelay: 0.1,
    ...props,
    overlayClassName: cx(styles.headerOverlay, props.overlayClassName),
  };
  return (
    <>
      <Tooltip {...finalProps}>{props.children}</Tooltip>
    </>
  );
};

export { ErrorTooltip, GeneralTooltip, HeaderTooltip };
