import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { actions as documentActions } from 'new/redux/documents/actions';

import cx from 'classnames';
import { Check, EyeEmpty, NavArrowDown, WarningTriangle } from 'iconoir-react';
import { useToggle } from 'new/hooks/useToggle';
import { MIXPANEL_EVENTS } from 'new/thirdParty/mixpanel';
import Badge from 'new/ui-elements/Badge';
import { focusAndScrollTo } from 'new/utils/focusAndScrollTo';
import { mixpanelTrackingAllEvents } from 'new/utils/mixpanel';
import OutsideClickHandler from 'react-outside-click-handler';

import styles from './GridSelectionDropdown.scss';

const confidenceIcons = {
  low: <EyeEmpty height={16} width={16} />,
  high: <Check height={16} width={16} />,
  error: <WarningTriangle height={16} width={16} />,
};

const GridSelectionDropdown = () => {
  const [showDropdown, toggleDropdown] = useToggle(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const optionsRef = useRef(null);
  const dispatch = useDispatch();

  const {
    footerGridsById,
    selectedSectionFieldId,
    fieldsById,
    selectedGridId,
    grids,
    documentsById,
    docId,
  } = useSelector((state) => state.documents.reviewTool);

  const options = useMemo(() => {
    const gridsIds = fieldsById[selectedSectionFieldId]?.gridIds ?? [];
    const options = gridsIds.map((gridId, index) => {
      const grid = footerGridsById[gridId];

      return {
        page: grid?.page || '',
        label: index + 1,
        confidence: {
          label: grid?.confidence,
          icon: confidenceIcons[grid?.confidence] || null,
        },
        id: gridId,
      };
    });

    return options || [];
  }, [selectedSectionFieldId, fieldsById, footerGridsById]);

  const selectedGrid = useMemo(() => {
    return options.find((option) => option.id === selectedGridId) || {};
  }, [selectedGridId, options]);

  useEffect(() => {
    if (focusedIndex !== null && optionsRef.current && showDropdown) {
      const items = optionsRef.current.getElementsByClassName(
        styles.menu__item
      );
      if (items.length > 0) {
        items[focusedIndex].focus();
        items[focusedIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [focusedIndex, showDropdown]);

  useEffect(() => {
    if (optionsRef.current && showDropdown) {
      const selectedOptionIndex = options.findIndex(
        (option) => option.id === selectedGridId
      );
      if (selectedOptionIndex !== -1) {
        setFocusedIndex(selectedOptionIndex);
      }
    }
  }, [options, selectedGridId, showDropdown]);

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = focusedIndex === null ? 0 : focusedIndex + 1;
      if (nextIndex < options.length) {
        setFocusedIndex(nextIndex);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex =
        focusedIndex === null ? options.length - 1 : focusedIndex - 1;
      if (prevIndex >= 0) {
        setFocusedIndex(prevIndex);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex !== null) {
        handleSelectItem(options[focusedIndex].id);
      }
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target.closest('#js-grid-selection-dropdown')) return;
    toggleDropdown(false);
  };

  const handleScroll = (gridId) => {
    const docMeta = documentsById[docId] || null;
    focusAndScrollTo(gridId, docMeta, grids, fieldsById, footerGridsById);
  };

  const handleSelectItem = (gridId) => {
    if (gridId) {
      dispatch(
        documentActions.rtSetCurrentGridId({
          gridId: gridId,
        })
      );
      handleScroll(gridId);
    }
    mixpanelTrackingAllEvents(MIXPANEL_EVENTS.grid_navigation_table);

    toggleDropdown(false);
  };

  return (
    <div
      className={cx(styles.menu)}
      onKeyDown={(e) => handleKeyDown(e)}
      tabIndex={0}
      role='listbox'
    >
      <div
        className={styles.menu__button}
        onClick={() => toggleDropdown()}
        role='presentation'
        id='js-grid-selection-dropdown'
      >
        {selectedGridId ? (
          <div className={styles.menuButton}>
            <span
              className={cx(
                styles.menuButton__icon,
                styles[`menuButton__icon--${selectedGrid?.confidence?.label}`]
              )}
            >
              {selectedGrid?.confidence?.icon}
            </span>
            <span className='mx-1'> Grid {selectedGrid?.label}</span>
            {selectedGrid?.page ? (
              <Badge
                title={`Page ${selectedGrid?.page}`}
                type='primary'
                className={styles['menuButton__badge']}
              />
            ) : null}
          </div>
        ) : (
          'Select table grid'
        )}
        <div
          className={cx(styles.menu__arrow, {
            [styles['menu__arrow--up']]: showDropdown,
          })}
        >
          <NavArrowDown />
        </div>
      </div>
      {showDropdown ? (
        <OutsideClickHandler onOutsideClick={handleOutsideClick}>
          <div className={styles.menu__list} ref={optionsRef}>
            {options.length ? (
              options.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    className={cx(styles.menu__item, {
                      [styles['menu__item--focused']]: focusedIndex === index,
                    })}
                  >
                    <div
                      className={styles.menuButton}
                      role='presentation'
                      onClick={() => handleSelectItem(item.id)}
                    >
                      <span
                        className={cx(
                          styles.menuButton__icon,
                          styles[`menuButton__icon--${item.confidence.label}`]
                        )}
                      >
                        {item?.confidence?.icon}
                      </span>
                      <span className='mx-1'> Grid {item.label}</span>
                      {item?.page ? (
                        <Badge
                          title={`Page ${item?.page}`}
                          type='primary'
                          className={styles['menuButton__badge']}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.menu__item}>
                <div
                  className={styles.menuButton}
                  role='presentation'
                  onClick={() => handleSelectItem()}
                >
                  No Options
                </div>
              </div>
            )}
          </div>
        </OutsideClickHandler>
      ) : null}
    </div>
  );
};

export default GridSelectionDropdown;
