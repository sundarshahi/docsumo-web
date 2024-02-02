import React from 'react';

import cx from 'classnames';
import { NavArrowDown, WrapText } from 'iconoir-react';
import { ReactComponent as WrapPre } from 'new/assets/images/icons/wrap-pre.svg';
import { useToggle } from 'new/hooks/useToggle';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Tooltip from 'new/ui-elements/Tooltip';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './GridViewWrapDropdown.scss';

const wrapList = [
  {
    id: 1,
    label: 'Normal',
    icon: <WrapPre />,
    value: {
      justifyWrap: 'pre',
      wrapHeight: '24px',
    },
  },
  {
    id: 2,
    label: 'Wrap',
    icon: <WrapText />,
    value: {
      justifyWrap: 'normal',
      wrapHeight: '100px',
    },
  },
];

const GridViewWrapDropdown = ({
  wrapItem,
  handleSelectWrap,
  mixpanelTracking,
}) => {
  const [showWrap, toggleWrapDropdown] = useToggle(false);

  const handleToggleWrapDropdown = () => {
    toggleWrapDropdown();
    mixpanelTracking(MIXPANEL_EVENTS.table_wrap_btn_click);
  };

  return (
    <div
      className={styles.viewWrap}
      onClick={handleToggleWrapDropdown}
      role='presentation'
    >
      <div title={'Text Wrap'} className={styles.icon}>
        {wrapItem.justifyWrap === 'pre' ? (
          <WrapPre className={styles.wrapIcon} />
        ) : wrapItem.justifyWrap === 'normal' ? (
          <WrapText className={styles.wrapIcon} />
        ) : (
          <WrapPre className={styles.wrapIcon} />
        )}
        <NavArrowDown className={styles.dropIcon} />
      </div>
      {showWrap ? (
        <OutsideClickHandler onOutsideClick={() => toggleWrapDropdown(false)}>
          <div className={styles.dropdownBox}>
            {wrapList.map((item) => {
              return (
                <Tooltip key={item.id} label={item.label}>
                  <div
                    role='presentation'
                    className={cx('unstyled-btn', styles.link, {
                      [styles.isSelected]:
                        item.value.justifyWrap === wrapItem.justifyWrap,
                    })}
                    onClick={() => handleSelectWrap(item.value)}
                  >
                    <p className={styles.icon}>{item.icon}</p>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </OutsideClickHandler>
      ) : null}
    </div>
  );
};

export default GridViewWrapDropdown;
