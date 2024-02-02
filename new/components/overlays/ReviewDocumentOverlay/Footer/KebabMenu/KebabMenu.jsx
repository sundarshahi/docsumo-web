/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo, useRef, useState } from 'react';

import cx from 'classnames';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  NavArrowRight,
} from 'iconoir-react';
import { MoreVert } from 'iconoir-react';
import { WrapText } from 'iconoir-react';
import IconButton from 'new/ui-elements/IconButton/IconButton';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './KebabMenu.scss';

const KebabMenu = ({
  toggleEmptyColumnVisibility,
  handleSelectWrap,
  handleSelectAlign,
  showHide,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef(null);

  const options = useMemo(
    () => [
      {
        label: 'Text align ',
        id: 'alignText',
        options: [
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
        ],
      },
      {
        label: 'Text wrap',
        id: 'wrapText',
        options: [
          {
            id: 1,
            label: 'Normal',
            icon: (
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M17 2L17 18'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
                <path
                  d='M3 2L3 18'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
                <path
                  d='M17 10L7 10'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
              </svg>
            ),
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
        ],
      },
      {
        label: showHide ? 'Show empty columns' : 'Hide empty columns',
        id: 'hideEmptyColumn',
      },
    ],
    [showHide]
  );

  const handleMenuToggle = () => setShowMenu(!showMenu);

  const handleNestedMenuItemClick = (id, value) => {
    if (id === 'wrapText') {
      handleSelectWrap(value);
    } else if (id === 'alignText') {
      handleSelectAlign(value);
    }
    setShowMenu(false);
  };

  const handleMenuItemClick = (id) => {
    if (id === 'hideEmptyColumn') {
      toggleEmptyColumnVisibility(!showHide);
    }
  };

  return (
    <div className={styles.menu}>
      <div ref={buttonRef} onClick={handleMenuToggle}>
        <IconButton
          icon={MoreVert}
          className={styles.menu__button}
          variant='text'
          size='extra-small'
        />
      </div>
      {showMenu ? (
        <OutsideClickHandler
          onOutsideClick={(event) => {
            if (buttonRef.current && buttonRef.current.contains(event.target)) {
              return;
            }
            setShowMenu(false);
          }}
        >
          <ul className={cx(styles.menu__list)}>
            {options.map(({ label, options, id }) => {
              return (
                <li
                  role='menuitem'
                  className={styles.menu__item}
                  key={label}
                  onClick={() => handleMenuItemClick(id)}
                >
                  {label}

                  {Array.isArray(options) && options.length ? (
                    <>
                      <NavArrowRight />
                      <ul
                        className={cx(
                          styles.menu__list,
                          styles['menu__list--nested']
                        )}
                      >
                        {options.map(({ label, icon, value }) => {
                          return (
                            <li
                              role='menuitem'
                              className={cx(
                                styles.menu__item,
                                styles['menu__item--nested']
                              )}
                              key={label}
                              onClick={() =>
                                handleNestedMenuItemClick(id, value)
                              }
                            >
                              <span className={styles.menu__icon}>{icon}</span>{' '}
                              {label}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </OutsideClickHandler>
      ) : (
        ''
      )}
    </div>
  );
};

export default KebabMenu;
