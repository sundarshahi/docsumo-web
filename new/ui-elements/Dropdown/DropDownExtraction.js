/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';
import Fuse from 'fuse.js';
import { NavArrowDown } from 'iconoir-react';
import { debounce } from 'lodash';
import Button from 'new/ui-elements/Button/Button';
import PropTypes from 'prop-types';
import OutsideClickHandler from 'react-outside-click-handler';
import Popover from 'react-tiny-popover';

import Badges from '../Badge/Badge';
import Checkbox from '../Checkbox/Checkbox';

import styles from './dropDownExtraction.scss';

export const DropdownExtraction = (props) => {
  const {
    onChange,
    placeholder = 'Select Value',
    value,
    error,
    data,
    id,
    formatOptionLabel,
    optionLabelKey = 'title',
    optionValueKey = 'value',
    className,
    iconToggle,
    multiSelect = false,
    onTrainModelClick,
    onImportClick,
    settingId = '',
  } = props;
  const [dropdownLabel, setDropdownLabel] = useState('');
  const [toggle, setToggle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDropdownData, setFilteredDropdownData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const options = {
    keys: [optionLabelKey],
  };

  const fuse = new Fuse(data, options);

  const searchInputRef = useRef(null);

  useEffect(() => {
    setFilteredDropdownData(data);

    if (value) {
      let label = '';
      if (multiSelect) {
        label = data?.map((item) => item[optionLabelKey]);
      } else {
        label = data?.find((item) => item[optionValueKey] === value)?.[
          optionLabelKey
        ];
      }
      setDropdownLabel(label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelection = (e, item) => {
    if (multiSelect) {
      e.stopPropagation();
      let newSelectedItems = [];
      if (
        selectedItems.some(
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
      setDropdownLabel(item[optionLabelKey]);
      onChange(item);
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
    if (toggle) {
      searchInputRef?.current?.focus();
    }
    if (searchQuery?.length) {
      handleSearch(searchQuery);
    } else {
      setFilteredDropdownData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, toggle]);

  const renderDropdownLabel = () =>
    !dropdownLabel ? (
      <span className={styles.dropdown__placeholder}>{placeholder}</span>
    ) : (
      <span className={styles.dropdown__value}>{dropdownLabel}</span>
    );

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
      <>
        {selectedItems.length === 0 ? (
          renderDropdownLabel()
        ) : (
          <div className={styles.dropdownBadges}>
            {selectedItems.map((item) => (
              <Badges
                key={item[optionValueKey]}
                title={item[optionLabelKey]}
                iconType={'close'}
                iconDirection='right'
              />
            ))}
          </div>
        )}
      </>
    );

  return (
    <OutsideClickHandler onOutsideClick={() => setToggle(false)}>
      <Popover
        isOpen={toggle}
        position={['bottom']}
        uid='doctype-settings-model'
        containerClassName={styles.popContainer}
        content={
          <div className={cx(styles.content)}>
            {filteredDropdownData.length === 1 &&
            filteredDropdownData[0].label === 'None' ? (
              <div
                className={styles.dropdownEmptyState}
                onClick={(e) => e.stopPropagation()}
              >
                <p className={styles.dropdownEmptyState__title}>
                  No model Available
                </p>
                <p className='mb-3'>
                  Click on the button below and train a model to use this
                  feature
                </p>

                {settingId === 86 ? (
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={onImportClick}
                  >
                    Import
                  </Button>
                ) : (
                  <Button
                    variant='outlined'
                    size='small'
                    onClick={onTrainModelClick}
                  >
                    Train a model
                  </Button>
                )}
              </div>
            ) : (
              <>
                {filteredDropdownData?.map((item) => (
                  <DropdownOptionItem
                    key={item[optionValueKey]}
                    item={item}
                    multiSelect={multiSelect}
                    handleSelection={handleSelection}
                    optionValueKey={optionValueKey}
                    selectedItems={selectedItems}
                    formatOptionLabel={formatOptionLabel}
                    dropdownLabel={dropdownLabel}
                    optionLabelKey={optionLabelKey}
                  />
                ))}
                <div className={styles.footer}>
                  <div className={styles.footer_text}>
                    <span>or</span>
                  </div>
                  <div className={styles.footer_btnGroup}>
                    {settingId === 86 ? (
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={onImportClick}
                      >
                        Import
                      </Button>
                    ) : (
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={onTrainModelClick}
                      >
                        Train a model
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        }
      >
        <div
          className={cx(styles.dropdown, className, {
            [styles['dropdown--select']]: iconToggle || toggle,
            [styles['dropdown--error']]: error,
          })}
          onClick={() => {
            setToggle(!toggle);
          }}
          key={id}
        >
          {renderDropdownLabel()}
          <div
            className={cx(styles.dropdown__icon, {
              [styles['dropdown__icon--toggle']]: iconToggle || toggle,
            })}
          >
            <NavArrowDown />
          </div>
        </div>
      </Popover>
    </OutsideClickHandler>
  );
};

const DropdownOptionItem = ({
  item,
  multiSelect,
  handleSelection,
  optionValueKey,
  selectedItems,
  formatOptionLabel,
  dropdownLabel,
  optionLabelKey,
}) => (
  <div
    className={cx('d-flex align-items-center', styles.dropdownContent)}
    key={item[optionValueKey]}
  >
    <div
      className={styles.dropdown__option__value}
      onClick={(e) => handleSelection(e, item)}
    >
      {multiSelect ? (
        <Checkbox
          checked={selectedItems.some(
            (selectedItem) =>
              selectedItem[optionValueKey] === item[optionValueKey]
          )}
        />
      ) : (
        ''
      )}
      {formatOptionLabel
        ? formatOptionLabel(item, dropdownLabel)
        : item[optionLabelKey]}
    </div>
  </div>
);

DropdownExtraction.propTypes = {
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  data: PropTypes.array,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  id: PropTypes.string,
  value: PropTypes.string,
  dropdownDisabledTooltipLabel: PropTypes.string,
  searchEnabled: PropTypes.bool,
  multiSelect: PropTypes.bool,
  otherOptionEnable: PropTypes.bool,
};
