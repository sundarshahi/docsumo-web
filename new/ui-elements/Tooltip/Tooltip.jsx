import React, { useState } from 'react';

import cx from 'classnames';
import { Cancel } from 'iconoir-react';
import PropTypes from 'prop-types';

import styles from './Tooltip.scss';

const Tooltip = ({
  placement = 'bottom',
  hasArrow = true,
  label,
  children,
  size = 'md',
  colorScheme = 'dark',
  className = '',
  customize = false,
  iconType = '',
  visible = false,
  displayOnHover = true,
  showTooltip = true,
  tooltipOverlayClassname,
  tooltipTriggerClassname,
}) => {
  const [hideTooltip, setHideTooltip] = useState(false);

  const handleClose = () => {
    setHideTooltip(true);
  };

  return (
    <div
      className={cx(
        styles.tooltip,
        styles[`tooltip--placement-${placement}`],
        {
          [styles['tooltip--arrow']]: hasArrow,
        },
        className
      )}
    >
      <div
        className={cx(
          styles.tooltip__trigger,
          {
            [styles['tooltip__trigger--show']]: displayOnHover,
          },
          tooltipTriggerClassname
        )}
      >
        {children}
        {showTooltip && (
          <div
            className={cx(
              styles.tooltip__overlay,
              styles[`tooltip__overlay--size-${size}`],
              styles[`tooltip__overlay--color-${colorScheme}`],
              {
                [styles['tooltip__overlay--custom']]: customize,
                [styles['tooltip__overlay--left-aligned']]:
                  iconType === 'close',
                [styles['tooltip__overlay--visible']]: visible && !hideTooltip,
              },
              tooltipOverlayClassname
            )}
            data-tooltip-overlay
          >
            {iconType === 'close' && (
              <button
                type='button'
                className={styles.tooltip__close}
                onClick={handleClose}
              >
                <Cancel />
              </button>
            )}
            {label}
            {hasArrow && (
              <span className={styles.tooltip__arrow} data-tooltip-arrow />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  placement: PropTypes.oneOf(['top', 'right', 'left', 'bottom']),
  hasArrow: PropTypes.bool,
  label: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.element,
    PropTypes.func,
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  colorScheme: PropTypes.string,
};

export default Tooltip;
