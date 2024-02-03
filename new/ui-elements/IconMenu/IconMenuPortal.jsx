/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

import cx from 'classnames';
import Tooltip from 'new/ui-elements/Tooltip/Tooltip';
import PropTypes from 'prop-types';
import OutsideClickHandler from 'react-outside-click-handler';
import { usePopper } from 'react-popper';
import { Portal } from 'react-portal';

import styles from './IconMenu.scss';

const IconMenuPortal = (props) => {
  const {
    position = 'bottom-right',
    tooltipPlacement = 'bottom',
    tooltipText = 'More',
    menuIcon,
    options,
    className,
    onDropdownItemClick,
    dropdownClassNames,
    placement = 'right-end',
    disabled = false,
    showTooltip = true,
  } = props;

  const dropdownWrapperClassNames = cx(
    styles.dropdownWrapper,
    styles[`position-${position}`],
    dropdownClassNames
  );

  const [showMenu, setShowMenu] = useState(false);

  const [referenceElement, setReferenceElement] = React.useState(null);
  const [popperElement, setPopperElement] = React.useState(null);

  const { styles: popperStyles, attributes } = usePopper(
    referenceElement,
    popperElement,
    {
      placement: placement,
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 5],
          },
        },
      ],
    }
  );

  const hideMenu = () => {
    setShowMenu(false);
  };

  const handleMenuToggle = () => setShowMenu(!showMenu);

  return (
    <div className={cx(styles.container, className)} tabIndex={0}>
      <Tooltip
        label={tooltipText}
        placement={tooltipPlacement}
        showTooltip={showTooltip && !showMenu}
        rootClassname={styles.navTooltip}
      >
        <div
          className={cx(styles.menuIcon, {
            [styles.menuIcon__open]: showMenu,
            [styles.disabled]: disabled,
          })}
          onClick={handleMenuToggle}
          ref={setReferenceElement}
        >
          {menuIcon}
        </div>
      </Tooltip>

      {showMenu ? (
        <Portal>
          <div
            ref={setPopperElement}
            className={dropdownWrapperClassNames}
            style={popperStyles.popper}
            {...attributes.popper}
          >
            <OutsideClickHandler onOutsideClick={hideMenu}>
              <IconDropdownList
                setShowMenu={setShowMenu}
                options={options}
                onDropdownItemClick={onDropdownItemClick}
              />
            </OutsideClickHandler>
          </div>
        </Portal>
      ) : (
        ''
      )}
    </div>
  );
};

IconMenuPortal.propTypes = {
  position: PropTypes.string,
  menuIcon: PropTypes.element,
  tooltipPlacement: PropTypes.string,
  tooltipText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      icon: PropTypes.element,
      classNames: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string,
      ]),
    })
  ),
  onDropdownItemClick: PropTypes.func,
  showTooltip: PropTypes.bool,
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

export default IconMenuPortal;
