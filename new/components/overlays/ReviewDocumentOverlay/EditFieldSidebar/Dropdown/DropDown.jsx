import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';
import { KEY_CODES } from 'new/constants/keyboard';
import OutsideClickHandler from 'react-outside-click-handler';

import { dataTypeIcons } from './icons';

import styles from './DropDown.scss';

function DropDown({
  options,
  value,
  onOptionClick,
  onOutsideClick,
  id,
  className,
  selectedDropdownId,
  handleFocus = null,
}) {
  const [selectedOption, setSelectedOption] = useState(value);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dropdownRef.current.focus();
    const currentIndex = findCurrentIndex();
    scrollIntoView(currentIndex);
    mountDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mountDropdown = () => {
    const element = document.getElementById(
      `selected-field-type-${selectedDropdownId}`
    );
    const dropdownEle = document.getElementById(
      `edit-drop-field-${selectedDropdownId}`
    );
    if (dropdownEle) showDataTypeDropdown(element, dropdownEle);
  };

  const showDataTypeDropdown = (element, dropdown) => {
    // Get element dimensions and position
    const elementRect = element?.getBoundingClientRect();

    // Get viewport dimensions
    const viewportHeight =
      document.getElementById('rt-sidebar-content')?.clientHeight;

    // Calculate space available both above and below the element
    const spaceAbove = elementRect?.top;
    const spaceBelow = viewportHeight - elementRect?.bottom;

    // Define the minimum space required for the dropdown
    const dropdownHeight = dropdown?.offsetHeight;

    dropdown.style.opacity = '1';

    // Check if there's enough space below the element
    if (spaceBelow >= dropdownHeight) {
      // There's enough space below, display the dropdown below the element
      dropdown.style.top = 'calc(100% + 0.375rem)';
    } else if (spaceAbove >= dropdownHeight) {
      // There's enough space above, display the dropdown above the element
      dropdown.style.bottom = 'calc(100% + 0.375rem)';
    } else {
      // Not enough space both above and below, decide how to handle this case
      // You could potentially resize the dropdown or handle it differently here
    }
  };

  const handleKeyDown = (e, i) => {
    e.preventDefault();
    const currentIndex = findCurrentIndex();
    const { keyCode } = e;
    if (keyCode === KEY_CODES.ARROW_UP) {
      if (currentIndex > 0) {
        scrollIntoView(currentIndex - 1);
      }
    } else if (keyCode === KEY_CODES.ARROW_DOWN) {
      if (currentIndex < options.length - 1) {
        scrollIntoView(currentIndex + 1);
      }
    } else if (keyCode === KEY_CODES.ENTER) {
      onOptionClick(selectedOption);
    }
  };

  const findCurrentIndex = () => {
    return options.findIndex((option) => option.type === selectedOption);
  };

  const scrollIntoView = (index) => {
    setSelectedOption(options[index]?.type);
    const itemElement = document.getElementById(`dropdown-${index}`);
    if (itemElement) {
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleOptionClick = (type) => {
    setSelectedOption(type);
    onOptionClick(type);
    handleFocus && handleFocus();
  };

  const renderOptions = () => {
    return options.map(({ label, type, disabled }, i) => (
      <div
        key={i}
        role='button'
        tabIndex={i}
        id={`dropdown-${i}`}
        ref={dropdownRef}
        className={cx(styles.link, {
          [styles.disabled]: disabled,
          [styles.selected]: type === selectedOption,
        })}
        onClick={() => !disabled && handleOptionClick(type)}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.iconWrapper}>
          {dataTypeIcons[type] || dataTypeIcons.default}
        </div>
        <p className={styles.label}>{label}</p>
      </div>
    ));
  };

  return (
    <div className={cx(styles.root, className)} id={id}>
      <OutsideClickHandler onOutsideClick={onOutsideClick}>
        <div className={styles.dropdown}>{renderOptions()}</div>
      </OutsideClickHandler>
    </div>
  );
}

export default DropDown;
