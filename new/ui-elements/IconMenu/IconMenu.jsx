/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

import cx from 'classnames';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import PropTypes from 'prop-types';

import styles from './IconMenu.scss';

const IconMenu = (props) => {
  const {
    position = 'bottom-right',
    tooltipPlacement = 'bottom',
    tooltipText = 'More',
    menuIcon,
    options,
    onDropdownItemClick,
    className = '',
    dropdownClassNames,
    showTooltip = true,
  } = props;
  const dropdownWrapperClassNames = cx(
    styles.dropdownWrapper,
    styles[`position-${position}`],
    dropdownClassNames
  );

  const [showMenu, setShowMenu] = useState(false);

  const handleBlur = () => {
    setShowMenu(false);
  };

  const handleMenuToggle = () => setShowMenu(!showMenu);

  return (
    <div
      className={cx(styles.container, className)}
      tabIndex={0}
      onBlur={handleBlur}
    >
      <Tooltip
        showTooltip={showTooltip && !showMenu}
        label={tooltipText}
        placement={tooltipPlacement}
        rootClassname={styles.navTooltip}
      >
        <div
          className={cx(styles.menuIcon, { [styles.menuIcon__open]: showMenu })}
          onClick={handleMenuToggle}
        >
          {menuIcon}
        </div>
      </Tooltip>

      {showMenu ? (
        <div className={dropdownWrapperClassNames}>
          <IconDropdownList
            setShowMenu={setShowMenu}
            options={options}
            onDropdownItemClick={onDropdownItemClick}
          />
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

IconMenu.propTypes = {
  position: PropTypes.string,
  menuIcon: PropTypes.element,
  tooltipPlacement: PropTypes.string,
  tooltipText: PropTypes.string,
  showTooltip: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.string,
      icon: PropTypes.element,
      classNames: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string,
      ]),
    })
  ),
  onDropdownItemClick: PropTypes.func,
  classNames: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

const IconDropdownList = ({ options, onDropdownItemClick, setShowMenu }) => {
  return (
    <ul className={cx(styles.dropdown, 'shadow-200')}>
      {options.map((option) => {
        const { key, title, icon, classNames } = option;
        return (
          <li
            role='menuitem'
            key={key}
            className={cx(
              styles.dropdownItem,
              'd-flex',
              'align-items-center',
              {
                [styles.disabled]: option.disabled,
              },
              classNames
            )}
            onClick={() => {
              onDropdownItemClick(option);
              setShowMenu(false);
            }}
          >
            {icon} &nbsp; <span>{title}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default IconMenu;
