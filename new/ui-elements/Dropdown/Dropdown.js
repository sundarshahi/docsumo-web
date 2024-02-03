/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';
import Fuse from 'fuse.js';
import { NavArrowDown } from 'iconoir-react';
import _ from 'lodash';
import { debounce, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import OutsideClickHandler from 'react-outside-click-handler';

import Badges from '../Badge/Badge';
import Checkbox from '../Checkbox/Checkbox';
import Tooltip from '../Tooltip/Tooltip';

import styles from './Dropdown.scss';

const DROPDOWN_SIZES = {
  medium: 'medium',
  large: 'large',
};

export const Dropdown = (props) => {
  const {
    onChange,
    placeholder = 'Select Value',
    value,
    error,
    data,
    disabled = false,
    children,
    id,
    formatOptionLabel,
    optionLabelKey = 'title',
    optionValueKey = 'value',
    optionClassNames,
    className,
    size = DROPDOWN_SIZES.medium,
    onOutsideClick,
    onClick,
    iconToggle,
    dropdownDisabledTooltipLabel = '',
    searchEnabled = false,
    multiSelect = false,
    otherOption,
    selectedValues = [],
    selectionPlaceholder = null,
  } = props;
  const [dropdownLabel, setDropdownLabel] = useState('');
  const [toggle, setToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDropdownData, setFilteredDropdownData] = useState([]);
  const [selectedItems, setSelectedItems] = useState(selectedValues || []);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);

  const options = {
    keys: [optionLabelKey],
  };

  const fuse = new Fuse(data, options);

  const searchInputRef = useRef(null);

  const optionsRef = useRef(null);

  useEffect(() => {
    setFilteredDropdownData(data);

    if (value) {
      let label = '';
      if (multiSelect) {
        label = data.map((item) => item[optionLabelKey]);
      } else {
        label = data.find((item) => item[optionValueKey] === value)?.[
          optionLabelKey
        ];
      }
      setDropdownLabel(label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, data]);

  useEffect(() => {
    if (toggle) {
      const height = optionsRef.current?.scrollHeight;
      const itemsHeight = height / filteredDropdownData.length;
      optionsRef.current?.scrollTo({
        top: selectedOptionIndex * itemsHeight,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, [selectedOptionIndex, toggle]);

  const isDropdownEmpty = isEmpty(data);
  const dropdownDisabled = isDropdownEmpty || disabled;

  const handleSelection = (e, item) => {
    if (multiSelect) {
      e.stopPropagation();
      let newSelectedItems = [];
      if (
        selectedItems?.some(
          (selectedItem) =>
            selectedItem[optionValueKey] === item[optionValueKey]
        )
      ) {
        newSelectedItems = selectedItems.filter(
          (selectedItem) =>
            selectedItem[optionValueKey] !== item[optionValueKey]
        );
      } else {
        newSelectedItems = [...selectedItems, item];
      }
      setSelectedItems(newSelectedItems);

      setDropdownLabel(
        newSelectedItems
          .map((selectedItem) => selectedItem[optionLabelKey])
          .join(', ')
      );
      onChange(newSelectedItems);
    } else {
      e.stopPropagation();
      setDropdownLabel(item[optionLabelKey]);
      onChange(item);
      setToggle(false);
    }
  };

  const handleSearchInputChange = ({ target: { value } }) => {
    setSearchQuery(value);
  };

  const handleSearch = debounce(
    (searchQuery) =>
      setFilteredDropdownData(
        fuse.search(searchQuery).map((fuseSearchItem) => fuseSearchItem.item)
      ),
    300
  );

  useEffect(() => {
    if (!toggle) {
      setSearchQuery('');
    }
    if (searchQuery?.length) {
      handleSearch(searchQuery);
    } else {
      setFilteredDropdownData(data);
    }
    setSelectedOptionIndex(-1);
  }, [searchQuery, toggle]);

  const renderDropdownLabel = () => {
    if (multiSelect) {
      if (selectionPlaceholder) {
        return selectionPlaceholder;
      } else {
        return (
          <div className={styles.dropdownBadges}>
            {selectedItems?.map((item) => (
              <Badges
                key={item[optionValueKey]}
                title={item[optionLabelKey]}
                iconType={'close'}
                iconDirection='right'
                badgeIconHandler={(e) =>
                  handleDropdownBadgeCloseBtnClick(e, item)
                }
              />
            ))}
          </div>
        );
      }
    } else {
      if (dropdownLabel) {
        return <span className={styles.dropdown__value}>{dropdownLabel}</span>;
      } else {
        return (
          <span className={styles.dropdown__placeholder}>{placeholder}</span>
        );
      }
    }
  };

  const renderDropdownSearch = () =>
    toggle ? (
      <input
        type='text'
        name='dropdown-search'
        onChange={handleSearchInputChange}
        value={searchQuery}
        placeholder={'Search'}
        ref={searchInputRef}
        className={styles.dropdownSearchInput}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    ) : (
      renderDropdownLabel()
    );

  const handleDropdownBadgeCloseBtnClick = (e, item) => {
    e.stopPropagation();

    let newSelectedItems = selectedItems.filter(
      (selectedItem) => selectedItem[optionValueKey] !== item[optionValueKey]
    );
    setSelectedItems(newSelectedItems);

    setDropdownLabel(
      newSelectedItems
        .map((selectedItem) => selectedItem[optionLabelKey])
        .join(', ')
    );
    onChange(newSelectedItems);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedOptionIndex((prevIndex) => {
        const newIndex =
          prevIndex - 1 < 0 ? filteredDropdownData.length - 1 : prevIndex - 1;
        return newIndex;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedOptionIndex((prevIndex) => {
        const newIndex =
          prevIndex + 1 >= filteredDropdownData.length ? 0 : prevIndex + 1;
        return newIndex;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedOptionIndex >= 0) {
        const selectedOption = filteredDropdownData[selectedOptionIndex];
        handleSelection(e, selectedOption);
      }
    } else if (e.key === ' ') {
      setToggle(!toggle);
    }
  };

  return (
    <OutsideClickHandler
      onOutsideClick={onOutsideClick ? onOutsideClick : () => setToggle(false)}
    >
      <Tooltip
        label={
          isDropdownEmpty
            ? 'No Options Available'
            : dropdownDisabledTooltipLabel
        }
        showTooltip={
          isDropdownEmpty ||
          (dropdownDisabledTooltipLabel.length !== 0 && dropdownDisabled)
        }
        className={styles.dropdownTooltip}
      >
        <div
          className={cx(styles.dropdown, className, {
            [styles['dropdown--select']]: iconToggle || toggle,
            [styles['dropdown--error']]: error,
            [styles['dropdown--disabled']]: dropdownDisabled,
          })}
          onClick={
            onClick
              ? onClick
              : !dropdownDisabled
              ? () => setToggle(!toggle)
              : null
          }
          onKeyDown={(e) => handleKeyDown(e)}
          role='combobox'
          aria-expanded={toggle}
          aria-haspopup='listbox'
          aria-owns='dropdown-options'
          aria-controls='dropdown-options'
          aria-labelledby='dropdown-label'
          aria-describedby='dropdown-tooltip'
          tabIndex={0}
          key={id}
        >
          {searchEnabled ? renderDropdownSearch() : renderDropdownLabel()}

          {children ? (
            children
          ) : (
            <>
              {toggle ? (
                <div
                  id='dropdown-options'
                  ref={optionsRef}
                  className={cx(styles.dropdown__option, optionClassNames, {
                    [styles.dropdown__option__searchEnabled]: searchEnabled,
                    [styles.dropdown__option__noSelectedItems]:
                      !selectedItems?.length,
                  })}
                  role='listbox'
                >
                  {multiSelect && searchEnabled && selectedItems?.length ? (
                    <div
                      className={cx(
                        styles.dropdownBadges,
                        styles.dropdownBadges_option
                      )}
                    >
                      {selectedItems.map((item) => (
                        <Badges
                          key={item[optionValueKey]}
                          title={item[optionLabelKey]}
                          iconType={'close'}
                          iconDirection='right'
                          badgeIconHandler={(e) =>
                            handleDropdownBadgeCloseBtnClick(e, item)
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    ''
                  )}
                  {filteredDropdownData?.map((item, index) => (
                    <DropdownOptionItem
                      key={item[optionValueKey]}
                      item={item}
                      index={index}
                      multiSelect={multiSelect}
                      handleSelection={handleSelection}
                      handleKeyDown={handleKeyDown}
                      optionValueKey={optionValueKey}
                      selectedItems={selectedItems}
                      formatOptionLabel={formatOptionLabel}
                      dropdownLabel={dropdownLabel}
                      optionLabelKey={optionLabelKey}
                      toggle={toggle}
                      selectedOptionIndex={selectedOptionIndex}
                      setToggle={setToggle}
                    />
                  ))}
                  {!_.isEmpty(otherOption) && (
                    <DropdownOptionItem
                      item={otherOption}
                      index={'other'}
                      multiSelect={multiSelect}
                      handleSelection={handleSelection}
                      handleKeyDown={handleKeyDown}
                      optionValueKey={optionValueKey}
                      selectedItems={selectedItems}
                      formatOptionLabel={formatOptionLabel}
                      dropdownLabel={dropdownLabel}
                      optionLabelKey={optionLabelKey}
                      toggle={toggle}
                      selectedOptionIndex={selectedOptionIndex}
                      setToggle={setToggle}
                    />
                  )}
                  {filteredDropdownData.length === 0 &&
                  _.isEmpty(otherOption) ? (
                    <div className={styles.dropdown__option__value}>
                      No Options Found
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          )}

          <div
            className={cx(styles.dropdown__icon, {
              [styles['dropdown__icon--toggle']]: iconToggle || toggle,
            })}
          >
            <NavArrowDown />
          </div>
        </div>
      </Tooltip>
    </OutsideClickHandler>
  );
};

const DropdownOptionItem = ({
  item,
  multiSelect,
  handleSelection,
  handleKeyDown,
  optionValueKey,
  selectedItems,
  formatOptionLabel,
  dropdownLabel,
  optionLabelKey,
  index,
  selectedOptionIndex,
}) => {
  const isChecked = selectedItems?.some(
    (selectedItem) => selectedItem[optionValueKey] === item[optionValueKey]
  );
  const isFocused = index === selectedOptionIndex;
  return (
    <div className='d-flex align-items-center' key={item[optionValueKey]}>
      <div
        tabIndex='-1'
        className={cx(styles.dropdown__option__value, {
          [styles.dropdown__option__value_focused]: isFocused,
        })}
        onClick={(e) => handleSelection(e, item)}
        role='option'
        aria-selected={isChecked}
      >
        {multiSelect ? <Checkbox tabIndex='-1' checked={isChecked} /> : ''}
        <span title={item[optionLabelKey]} tabIndex='-1'>
          {formatOptionLabel
            ? formatOptionLabel(item, dropdownLabel)
            : item[optionLabelKey]}
        </span>
      </div>
    </div>
  );
};

Dropdown.propTypes = {
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  data: PropTypes.array,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  id: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dropdownDisabledTooltipLabel: PropTypes.string,
  searchEnabled: PropTypes.bool,
  multiSelect: PropTypes.bool,
  otherOptionEnable: PropTypes.bool,
};
