import React from 'react';

import cx from 'classnames';
import {
  Cancel,
  CheckCircle,
  DeleteCircle,
  InfoEmpty,
  WarningCircle,
} from 'iconoir-react';

import styles from './Banner.scss';

const Banner = ({
  variant = 'success',
  icon = '',
  children = HTMLElement,
  color = '',
  className,
  showCloseBtn = false,
  handleCloseBtnClick = () => {},
}) => {
  const iconDefaultProps = {
    color,
    height: 16,
    width: 16,
  };

  const iconList = {
    success: <CheckCircle {...iconDefaultProps} />,
    error: <DeleteCircle {...iconDefaultProps} />,
    warning: <WarningCircle {...iconDefaultProps} />,
    info: <InfoEmpty {...iconDefaultProps} />,
  };

  return (
    <div className={cx(styles.banner, styles[variant], className)}>
      <div className={styles.icon}>{icon ? icon : iconList[variant]}</div>
      <div className={styles.label} style={{ color: color }}>
        {children}
      </div>
      {showCloseBtn && (
        <div
          className={styles.closeBtn}
          onClick={handleCloseBtnClick}
          aria-hidden='true'
        >
          <Cancel {...iconDefaultProps} />
        </div>
      )}
    </div>
  );
};

export default Banner;
