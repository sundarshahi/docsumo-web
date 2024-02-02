import React from 'react';

import cx from 'classnames';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  NavArrowDown,
} from 'iconoir-react';
import { useToggle } from 'new/hooks/useToggle';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Tooltip from 'new/ui-elements/Tooltip';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './GridAlignmentDropdown.scss';

const alignments = [
  {
    id: 1,
    label: 'Left',
    icon: <AlignLeft />,
    value: {
      textAlign: 'left',
      justifyAlign: 'flex-start',
    },
  },
  {
    id: 2,
    label: 'Center',
    icon: <AlignCenter />,
    value: {
      textAlign: 'center',
      justifyAlign: 'center',
    },
  },
  {
    id: 3,
    label: 'Right',
    icon: <AlignRight />,
    value: {
      textAlign: 'right',
      justifyAlign: 'flex-end',
    },
  },
];

const GridAlignmentDropdown = ({
  alignItem,
  handleSelectAlign,
  mixpanelTracking,
}) => {
  const [showAlignment, toggleAlignmentDropdown] = useToggle(false);

  const handleToggleAlignment = () => {
    toggleAlignmentDropdown();
    mixpanelTracking(MIXPANEL_EVENTS.table_align_btn_click);
  };

  return (
    <div
      role='presentation'
      className={styles.viewAlign}
      onClick={handleToggleAlignment}
    >
      <div title={'Text Align'} className={styles.icon}>
        {alignItem.textAlign === 'left' ? (
          <AlignLeft className={styles.alignIcon} />
        ) : alignItem.textAlign === 'center' ? (
          <AlignCenter className={styles.alignIcon} />
        ) : alignItem.textAlign === 'right' ? (
          <AlignRight className={styles.alignIcon} />
        ) : (
          <AlignJustify className={styles.alignIcon} />
        )}
        <NavArrowDown className={styles.dropIcon} />
      </div>
      {showAlignment ? (
        <OutsideClickHandler
          onOutsideClick={() => toggleAlignmentDropdown(false)}
        >
          <div className={styles.dropdownBox}>
            {alignments.map((item) => {
              return (
                <Tooltip label={item.label} key={item.id}>
                  <div
                    role='presentation'
                    className={cx('unstyled-btn', styles.link, {
                      [styles.isSelected]:
                        item.value.textAlign === alignItem.textAlign,
                    })}
                    onClick={() => handleSelectAlign(item.value)}
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

export default GridAlignmentDropdown;
